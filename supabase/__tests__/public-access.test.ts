import { describe, expect, test } from 'vitest'
import { anon } from './clients.ts'

async function anyMemberId() {
  const { data } = await anon.from('members').select('id').limit(1).single()
  if (!data) throw new Error('The database needs at least one Member for these tests')
  return data.id
}

describe('a visitor who is not signed in', () => {
  test.each(['groups', 'members', 'payments'] as const)('can read %s', async (table) => {
    const { error } = await anon.from(table).select('*').limit(1)
    expect(error).toBeNull()
  })

  test('sees exactly one Group', async () => {
    const { data, error } = await anon.from('groups').select('name, monthly_price, currency')
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
  })

  test('cannot see who the Admin is', async () => {
    const { error } = await anon.from('admins').select('*')
    expect(error).not.toBeNull()
  })

  test('cannot add, change or remove Members', async () => {
    const id = await anyMemberId()
    const insert = await anon.from('members').insert({ name: 'Intruder', slug: 'intruder' })
    expect(insert.error).not.toBeNull()

    const update = await anon.from('members').update({ name: 'Hacked' }).eq('id', id).select()
    expect(update.data ?? []).toEqual([]) // RLS hides the row from the update, so nothing changes

    const remove = await anon.from('members').delete().eq('id', id).select()
    expect(remove.data ?? []).toEqual([])
  })

  test('cannot change the Group', async () => {
    const update = await anon.from('groups').update({ monthly_price: 1 }).eq('id', true).select()
    expect(update.data ?? []).toEqual([])
  })

  test('cannot write Payments directly', async () => {
    const id = await anyMemberId()
    const insert = await anon.from('payments').insert({ member_id: id, first_month: '2026-01-01', months: 1, received_on: '2026-01-01' })
    expect(insert.error?.code).toBe('42501')
    const remove = await anon.from('payments').delete().eq('member_id', id).select()
    expect(remove.error?.code).toBe('42501')
  })

  test('cannot record or delete Payments through the functions', async () => {
    const id = await anyMemberId()
    const record = await anon.rpc('record_payment', { p_member_id: id, p_months: 1 })
    expect(record.error).not.toBeNull()
    const remove = await anon.rpc('delete_latest_payment', { p_member_id: id })
    expect(remove.error).not.toBeNull()
  })
})
