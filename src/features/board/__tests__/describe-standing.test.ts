import { describe, expect, test } from 'vitest'
import type { Standing } from '../../../model'
import { describeStanding } from '../describe-standing'

type DatedStanding = Extract<Standing, { daysUntilDue: number }>

const paid = (daysUntilDue: number, dueDate = '2026-11-01', paidThrough = '2026-10'): DatedStanding => ({
  status: daysUntilDue <= 7 ? 'dueSoon' : 'paid',
  paidThrough,
  dueDate,
  daysUntilDue,
  monthsBehind: 0,
})
const overdue = (daysUntilDue: number, monthsBehind: number): DatedStanding => ({
  status: 'overdue',
  paidThrough: '2026-07',
  dueDate: '2026-08-01',
  daysUntilDue,
  monthsBehind,
})

describe('describeStanding in English', () => {
  test('a Paid Member', () => {
    expect(describeStanding(paid(15), 'en')).toEqual({
      pill: 'Paid',
      primary: 'Next payment · 1 November',
      dueDate: '1 November',
      relative: 'in 15 days',
      paidThrough: 'Paid through October',
    })
  })

  test('one day left, and due today', () => {
    expect(describeStanding(paid(1), 'en')).toMatchObject({ pill: 'Due soon', relative: 'in 1 day' })
    expect(describeStanding({ ...overdue(0, 1), dueDate: '2026-11-01', paidThrough: '2026-10' }, 'en')).toMatchObject({
      pill: 'Overdue',
      relative: 'due today',
    })
  })

  test('an Overdue Member several months behind', () => {
    expect(describeStanding(overdue(-77, 3), 'en')).toEqual({
      pill: '3 months behind',
      primary: 'Next payment · 1 August',
      dueDate: '1 August',
      relative: '77 days late',
      paidThrough: 'Paid through July',
    })
    expect(describeStanding(overdue(-1, 1), 'en')).toMatchObject({ pill: 'Overdue', relative: '1 day late' })
  })

  test('Exempt and Unknown Members', () => {
    expect(describeStanding({ status: 'exempt' }, 'en')).toEqual({ pill: 'Exempt', primary: 'Covers the plan', dueDate: null, relative: null, paidThrough: null })
    expect(describeStanding({ status: 'unknown' }, 'en')).toEqual({ pill: 'Unknown', primary: 'No payments yet', dueDate: null, relative: null, paidThrough: null })
  })
})

describe('describeStanding in Ukrainian', () => {
  test('a Paid Member', () => {
    expect(describeStanding(paid(15), 'uk')).toEqual({
      pill: 'Сплачено',
      primary: 'Наступний платіж · 1 листопада',
      dueDate: '1 листопада',
      relative: 'через 15 днів',
      paidThrough: 'Сплачено по жовтень',
    })
  })

  test('day counts take the right plural form', () => {
    expect(describeStanding(paid(1), 'uk').relative).toBe('через 1 день')
    expect(describeStanding(paid(3), 'uk').relative).toBe('через 3 дні')
    expect(describeStanding(paid(5), 'uk').relative).toBe('через 5 днів')
    expect(describeStanding(paid(21), 'uk').relative).toBe('через 21 день')
    expect(describeStanding(overdue(-2, 1), 'uk').relative).toBe('прострочено на 2 дні')
    expect(describeStanding(overdue(-11, 1), 'uk').relative).toBe('прострочено на 11 днів')
  })

  test('month counts take the right plural form', () => {
    expect(describeStanding(overdue(-40, 2), 'uk').pill).toBe('Прострочено 2 місяці')
    expect(describeStanding(overdue(-140, 5), 'uk').pill).toBe('Прострочено 5 місяців')
  })

  test('due today, Exempt and Unknown', () => {
    expect(describeStanding({ ...overdue(0, 1), dueDate: '2026-11-01', paidThrough: '2026-10' }, 'uk').relative).toBe('платіж сьогодні')
    expect(describeStanding({ status: 'exempt' }, 'uk')).toMatchObject({ pill: 'Не платить', primary: 'Власник підписки' })
    expect(describeStanding({ status: 'unknown' }, 'uk')).toMatchObject({ pill: 'Невідомо', primary: 'Платежів ще немає' })
  })
})
