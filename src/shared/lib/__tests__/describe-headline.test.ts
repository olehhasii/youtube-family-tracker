import { describe, expect, test } from 'vitest'
import type { DatedStanding, Standing } from '../../../model/types'
import { describeHeadline } from '../describe-headline'

const paid = (name: string, daysUntilDue: number, dueDate: string): { name: string; standing: DatedStanding } => ({
  name,
  standing: { status: daysUntilDue <= 7 ? 'dueSoon' : 'paid', paidThrough: '2026-10', dueDate, daysUntilDue, monthsBehind: 0 },
})

const overdue = (name: string, daysUntilDue: number, monthsBehind: number): { name: string; standing: DatedStanding } => ({
  name,
  standing: { status: 'overdue', paidThrough: '2026-07', dueDate: '2026-08-01', daysUntilDue, monthsBehind },
})

describe('describeHeadline', () => {
  test('with nobody behind, the earliest upcoming Due Date', () => {
    const rows = [paid('Ira', 20, '2026-11-06'), paid('Sasha', 15, '2026-11-01')]
    expect(describeHeadline(rows, 'en')).toEqual({ label: 'Next payment', text: '1 November' })
    expect(describeHeadline(rows, 'uk')).toEqual({ label: 'Наступний платіж', text: '1 листопада' })
  })

  test('the Member furthest behind wins over any upcoming Due Date', () => {
    const rows = [paid('Ira', 3, '2026-10-20'), overdue('Dima', -10, 1), overdue('Sasha', -77, 3), overdue('Olia', -40, 2)]
    expect(describeHeadline(rows, 'en')).toEqual({ label: 'Behind', text: 'Sasha · 3 months' })
    expect(describeHeadline(rows, 'uk')).toEqual({ label: 'Заборгованість', text: 'Sasha · 3 місяці' })
  })

  test('a Member one month behind or less reads in days', () => {
    expect(describeHeadline([overdue('Dima', -10, 1)], 'en')).toEqual({ label: 'Behind', text: 'Dima · 10 days late' })
    expect(describeHeadline([overdue('Dima', 0, 1)], 'uk')).toEqual({ label: 'Заборгованість', text: 'Dima · платіж сьогодні' })
  })

  test('with no Due Date anywhere, says nothing is recorded yet', () => {
    const rows: { name: string; standing: Standing }[] = [
      { name: 'Oleh', standing: { status: 'exempt' } },
      { name: 'Sasha', standing: { status: 'unknown' } },
    ]
    expect(describeHeadline(rows, 'en')).toEqual({ label: 'Payments', text: 'None recorded yet' })
    expect(describeHeadline([], 'uk')).toEqual({ label: 'Платежі', text: 'Ще нічого не внесено' })
  })
})
