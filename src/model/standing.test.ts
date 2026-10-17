import { describe, expect, test } from 'vitest'
import { standing } from './standing'
import { dima, oleh, pay, sasha } from './testing'

describe('standing', () => {
  test('an Exempt Member is Exempt whatever their Payments', () => {
    expect(standing(oleh, [], '2026-10-17').status).toBe('exempt')
  })

  test('a Member with no Payments is Unknown', () => {
    expect(standing(sasha, [], '2026-10-17').status).toBe('unknown')
  })

  test('paid Jan–Oct: paid through October, due 1 November, Paid', () => {
    const s = standing(sasha, [pay('2026-01', 10)], '2026-10-17')
    expect(s).toMatchObject({ status: 'paid', paidThrough: '2026-10', dueDate: '2026-11-01', daysUntilDue: 15 })
  })

  test('Due Soon starts exactly 7 days before the Due Date', () => {
    expect(standing(sasha, [pay('2026-01', 10)], '2026-10-24')).toMatchObject({ status: 'paid', daysUntilDue: 8 })
    expect(standing(sasha, [pay('2026-01', 10)], '2026-10-25')).toMatchObject({ status: 'dueSoon', daysUntilDue: 7 })
    expect(standing(sasha, [pay('2026-01', 10)], '2026-10-31')).toMatchObject({ status: 'dueSoon', daysUntilDue: 1 })
  })

  test('on the Due Date itself the Member is Overdue by 1 month', () => {
    expect(standing(sasha, [pay('2026-01', 10)], '2026-11-01')).toMatchObject({ status: 'overdue', daysUntilDue: 0, monthsBehind: 1 })
  })

  test('paid through July, today mid-October: Overdue and 3 months behind (Aug, Sep, Oct)', () => {
    expect(standing(sasha, [pay('2026-05', 3)], '2026-10-17')).toMatchObject({
      status: 'overdue',
      paidThrough: '2026-07',
      dueDate: '2026-08-01',
      daysUntilDue: -77,
      monthsBehind: 3,
    })
  })

  test('a Member who is not Overdue is 0 months behind', () => {
    expect(standing(sasha, [pay('2026-01', 10)], '2026-10-17')).toMatchObject({ monthsBehind: 0 })
  })

  test('Payments across a year boundary, given in any order, are read as one run', () => {
    const s = standing(sasha, [pay('2027-01', 2), pay('2026-11', 2)], '2026-12-28')
    expect(s).toMatchObject({ status: 'paid', paidThrough: '2027-02', dueDate: '2027-03-01', daysUntilDue: 63 })
  })

  test('Overdue across a year boundary counts December and January', () => {
    expect(standing(sasha, [pay('2026-09', 3)], '2027-01-10')).toMatchObject({
      status: 'overdue',
      dueDate: '2026-12-01',
      daysUntilDue: -40,
      monthsBehind: 2,
    })
  })

  test('Due Soon reaches across a year boundary: paid through December, due 1 January', () => {
    expect(standing(sasha, [pay('2026-12', 1)], '2026-12-25')).toMatchObject({ status: 'dueSoon', dueDate: '2027-01-01', daysUntilDue: 7 })
    expect(standing(sasha, [pay('2026-12', 1)], '2027-01-01')).toMatchObject({ status: 'overdue', daysUntilDue: 0, monthsBehind: 1 })
  })

  test('leap February counts 29 days toward a 1 March Due Date', () => {
    expect(standing(sasha, [pay('2028-01', 2)], '2028-02-22')).toMatchObject({ status: 'paid', daysUntilDue: 8 })
    expect(standing(sasha, [pay('2028-01', 2)], '2028-02-23')).toMatchObject({ status: 'dueSoon', daysUntilDue: 7 })
  })

  test("other Members' Payments are ignored", () => {
    expect(standing(sasha, [pay('2026-01', 12, dima)], '2026-10-17').status).toBe('unknown')
  })
})

