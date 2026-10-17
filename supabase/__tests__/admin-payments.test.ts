import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../src/data/database.types.ts'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { anon, signedInAdmin } from './clients.ts'

// Each test works on its own throwaway Member, so the seeded data is never touched.
let admin: SupabaseClient<Database>
const created: string[] = []

beforeAll(async () => {
  admin = await signedInAdmin()
})

afterAll(async () => {
  if (created.length) await admin.from('members').delete().in('id', created) // Payments go with them (cascade)
})

async function tempMember(exempt = false) {
  const slug = `test-${crypto.randomUUID().slice(0, 8)}`
  const { data, error } = await admin.from('members').insert({ name: 'Test Member', slug, exempt }).select('id').single()
  if (error) throw error
  created.push(data.id)
  return data.id
}

const record = (memberId: string, months: number) => admin.rpc('record_payment', { p_member_id: memberId, p_months: months })

/** A non-Exempt Member whose last Paid Month is before the current month, with their first unpaid month. */
async function findOverdueMember() {
  const { data: members } = await anon.from('members').select('id, exempt, payments(first_month, months)')
  for (const m of members ?? []) {
    if (m.exempt || !m.payments.length) continue
    const ends = m.payments.map((p) => monthAfter(p.first_month, p.months))
    const firstUnpaid = ends.sort().at(-1)!
    if (firstUnpaid < kyivMonthStart()) return { id: m.id, firstUnpaid }
  }
  return null
}

/** YYYY-MM-01 of the month after a run of `months` months starting at `firstMonth` (YYYY-MM-01). */
function monthAfter(firstMonth: string, months: number) {
  const [y, m] = firstMonth.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1 + months, 1)).toISOString().slice(0, 10)
}

/** The current month in Kyiv as YYYY-MM-01, independent of the database's own calculation. */
function kyivMonthStart(offset = 0) {
  const [y, m] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Kyiv', year: 'numeric', month: '2-digit' })
    .format(new Date())
    .split('-')
    .map(Number)
  const d = new Date(Date.UTC(y, m - 1 + offset, 1))
  return d.toISOString().slice(0, 10)
}

describe('record_payment (as the Admin)', () => {
  test("a Member's first Payment starts at the current month", async () => {
    const id = await tempMember()
    const { data, error } = await record(id, 2)
    expect(error).toBeNull()
    expect(data).toMatchObject({ member_id: id, first_month: kyivMonthStart(), months: 2 })
  })

  test('the next Payment continues right after the last Paid Month', async () => {
    const id = await tempMember()
    await record(id, 2)
    const { data, error } = await record(id, 3)
    expect(error).toBeNull()
    expect(data).toMatchObject({ first_month: kyivMonthStart(2), months: 3 })
  })

  test("an Overdue Member's Payment fills the oldest unpaid month, not the current one", async (ctx) => {
    const overdue = await findOverdueMember()
    if (!overdue) return ctx.skip() // needs data with someone behind (the seed has Sasha)
    const { data, error } = await record(overdue.id, 1)
    try {
      expect(error).toBeNull()
      expect(data!.first_month).toBe(overdue.firstUnpaid)
      expect(data!.first_month < kyivMonthStart()).toBe(true)
    } finally {
      await admin.rpc('delete_latest_payment', { p_member_id: overdue.id }) // leave the shared data as it was
    }
  })

  test('a Payment must cover at least one whole month', async () => {
    const id = await tempMember()
    expect((await record(id, 0)).error?.code).toBe('22023')
    expect((await record(id, -1)).error?.code).toBe('22023')
  })

  test('Exempt Members cannot be given Payments', async () => {
    const id = await tempMember(true)
    expect((await record(id, 1)).error?.code).toBe('22023')
  })

  test('recorded Payments are visible to everyone', async () => {
    const id = await tempMember()
    const { data: recorded } = await record(id, 1)
    const { data } = await anon.from('payments').select('id').eq('id', recorded!.id)
    expect(data).toHaveLength(1)
  })
})

describe('the Admin and the payments table', () => {
  test('even the Admin cannot write Payments directly, only through the functions', async () => {
    const id = await tempMember()
    const insert = await admin.from('payments').insert({ member_id: id, first_month: '2020-01-01', months: 1, received_on: '2020-01-01' })
    expect(insert.error?.code).toBe('42501')
    const update = await admin.from('payments').update({ months: 99 }).eq('member_id', id)
    expect(update.error?.code).toBe('42501')
  })
})

describe('delete_latest_payment (as the Admin)', () => {
  test('removes only the latest Payment', async () => {
    const id = await tempMember()
    const { data: first } = await record(id, 2)
    const { data: second } = await record(id, 1)

    const { data: removed, error } = await admin.rpc('delete_latest_payment', { p_member_id: id })
    expect(error).toBeNull()
    expect(removed?.id).toBe(second!.id)

    const { data: left } = await anon.from('payments').select('id').eq('member_id', id)
    expect(left?.map((p) => p.id)).toEqual([first!.id])
  })

  test('with a Payment id, deletes only if that Payment is still the latest', async () => {
    const id = await tempMember()
    const { data: first } = await record(id, 2)
    const { data: second } = await record(id, 1)

    const stale = await admin.rpc('delete_latest_payment', { p_member_id: id, p_payment_id: first!.id })
    expect(stale.error?.code).toBe('PT409')

    const { data: removed, error } = await admin.rpc('delete_latest_payment', { p_member_id: id, p_payment_id: second!.id })
    expect(error).toBeNull()
    expect(removed?.id).toBe(second!.id)
  })

  test('does nothing for a Member without Payments', async () => {
    const id = await tempMember()
    const { data, error } = await admin.rpc('delete_latest_payment', { p_member_id: id })
    expect(error).toBeNull()
    expect(data?.id ?? null).toBeNull()
  })
})
