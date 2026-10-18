import { describe, expect, test } from 'vitest'
import { type BoardTables, toBoard } from '../board'

type MemberRow = BoardTables['members'][number]
type PaymentRow = BoardTables['payments'][number]

const group = { id: true, name: 'Family Premium', monthly_price: 299, currency: 'UAH' }

function member(slug: string, position: number, exempt = false): MemberRow {
  return { id: `id-${slug}`, name: slug[0].toUpperCase() + slug.slice(1), slug, exempt, position, avatar_path: null, created_at: '2026-01-01T00:00:00Z' }
}

let n = 0
function payment(slug: string, firstMonth: string, months: number): PaymentRow {
  return { id: `p${++n}`, member_id: `id-${slug}`, first_month: `${firstMonth}-01`, months, received_on: `${firstMonth}-01`, created_at: '2026-01-01T00:00:00Z' }
}

describe('toBoard', () => {
  test("turns a Member's rows into their Standing and Payments in model terms", () => {
    const board = toBoard({ group, members: [member('sasha', 1)], payments: [payment('sasha', '2026-05', 3)] }, '2026-10-17')
    const [row] = board.rows
    expect(row.member).toMatchObject({ id: 'id-sasha', name: 'Sasha', slug: 'sasha', exempt: false, avatarPath: null, avatarUrl: null })
    expect(row.standing).toMatchObject({ status: 'overdue', paidThrough: '2026-07', dueDate: '2026-08-01', monthsBehind: 3 })
    expect(row.payments).toEqual([{ id: expect.any(String), memberId: 'id-sasha', firstMonth: '2026-05', months: 3, receivedOn: '2026-05-01' }])
  })

  test("each row only carries that Member's Payments, newest first", () => {
    const board = toBoard(
      {
        group,
        members: [member('sasha', 1), member('dima', 2)],
        payments: [payment('sasha', '2026-01', 2), payment('dima', '2026-01', 12), payment('sasha', '2026-03', 9)],
      },
      '2026-10-17',
    )
    const sasha = board.rows.find((r) => r.member.slug === 'sasha')!
    expect(sasha.payments.map((p) => p.firstMonth)).toEqual(['2026-03', '2026-01'])
  })

  test('rows come in Board order, and by position within a Status', () => {
    const board = toBoard(
      {
        group,
        members: [member('kate', 5), member('max', 4), member('oleh', 0, true), member('ira', 3), member('sasha', 1)],
        payments: [payment('max', '2026-10', 3), payment('ira', '2026-09', 6), payment('sasha', '2026-05', 3)],
      },
      '2026-10-17',
    )
    expect(board.rows.map((r) => r.member.slug)).toEqual(['oleh', 'sasha', 'ira', 'max', 'kate'])
  })

  test('Members sharing a position are ordered by name, so the order never jumps between fetches', () => {
    const board = toBoard({ group, members: [member('zoe', 1), member('ann', 1), member('max', 0)], payments: [] }, '2026-10-17')
    expect(board.rows.map((r) => r.member.slug)).toEqual(['max', 'ann', 'zoe'])
  })

  test('without a Group yet, the Board is empty rather than broken', () => {
    const board = toBoard({ group: null, members: [], payments: [] }, '2026-10-17')
    expect(board.group).toBeNull()
    expect(board.rows).toEqual([])
  })

  test('the Board remembers which day it was worked out for', () => {
    expect(toBoard({ group, members: [], payments: [] }, '2026-10-17').today).toBe('2026-10-17')
  })

  test('the summary counts who is paid up among Members who pay, and the price per person', () => {
    const board = toBoard(
      {
        group,
        members: [member('oleh', 0, true), member('sasha', 1), member('dima', 2), member('ira', 3), member('max', 4), member('kate', 5)],
        payments: [payment('sasha', '2026-05', 3), payment('dima', '2026-05', 6), payment('ira', '2026-10', 3), payment('max', '2026-10', 1)],
      },
      '2026-10-27', // Max and Dima are Due Soon, which still counts as paid up
    )
    expect(board.group).toEqual({ name: 'Family Premium', monthlyPrice: 299, currency: 'UAH' })
    expect(board.summary).toEqual({ paidUp: 3, paying: 5, pricePerPerson: 299 / 6 }) // Oleh is Exempt but still holds a share
  })
})
