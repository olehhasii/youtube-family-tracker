import { describe, expect, test } from 'vitest'
import { deletablePayment, nextPaymentMonths } from './payments'
import { dima, pay, sasha } from './testing'

describe('nextPaymentMonths', () => {
  test("a Member's first Payment starts at the current month", () => {
    expect(nextPaymentMonths(sasha, [], '2026-10-17', 2)).toEqual({ first: '2026-10', last: '2026-11' })
  })

  test('paid through July and Overdue in October: one month covers August, not October', () => {
    expect(nextPaymentMonths(sasha, [pay('2026-05', 3)], '2026-10-17', 1)).toEqual({ first: '2026-08', last: '2026-08' })
  })

  test('paid ahead through January: three months cover February to April', () => {
    expect(nextPaymentMonths(sasha, [pay('2026-11', 1), pay('2026-12', 2)], '2026-10-17', 3)).toEqual({ first: '2027-02', last: '2027-04' })
  })

  test("other Members' Payments don't move where a Member's next Payment starts", () => {
    const ledger = [pay('2026-05', 3, sasha), pay('2027-05', 1, dima)]
    expect(nextPaymentMonths(sasha, ledger, '2026-10-17', 1)).toEqual({ first: '2026-08', last: '2026-08' })
  })

  test('a Payment covers at least one whole month', () => {
    expect(() => nextPaymentMonths(sasha, [], '2026-10-17', 0)).toThrow(RangeError)
    expect(() => nextPaymentMonths(sasha, [], '2026-10-17', -2)).toThrow(RangeError)
    expect(() => nextPaymentMonths(sasha, [], '2026-10-17', 1.5)).toThrow(RangeError)
  })
})

describe('deletablePayment', () => {
  test('only the latest Payment can be deleted, whatever order the Payments come in', () => {
    const jan = pay('2026-01', 3)
    const apr = pay('2026-04', 2)
    const jun = pay('2026-06', 1)
    expect(deletablePayment(sasha, [apr, jun, jan])).toBe(jun)
  })

  test("another Member's later Payment is never the one offered for deletion", () => {
    const sashaJun = pay('2026-06', 1, sasha)
    expect(deletablePayment(sasha, [sashaJun, pay('2027-01', 2, dima)])).toBe(sashaJun)
  })

  test('nothing can be deleted when there are no Payments', () => {
    expect(deletablePayment(sasha, [])).toBeNull()
  })
})
