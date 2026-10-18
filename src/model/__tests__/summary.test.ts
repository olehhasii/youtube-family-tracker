import { expect, test } from 'vitest'
import { groupSummary } from '../summary'
import type { Status } from '../types'

const statuses = (...s: Status[]) => s

test('Paid and Due Soon Members are Paid Up; Exempt Members are not Paying', () => {
  expect(groupSummary(statuses('exempt', 'overdue', 'dueSoon', 'paid', 'paid', 'unknown'), 299)).toMatchObject({ paidUp: 3, paying: 5 })
})

test('the price is shared by every Member, Exempt ones included', () => {
  expect(groupSummary(statuses('exempt', 'paid', 'paid', 'overdue'), 300).pricePerPerson).toBe(75)
  expect(groupSummary(statuses('exempt'), 299).pricePerPerson).toBe(299)
})

test('with no Members there is no price per person', () => {
  expect(groupSummary([], 299)).toEqual({ paidUp: 0, paying: 0, pricePerPerson: null })
})
