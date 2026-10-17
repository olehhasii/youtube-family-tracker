import { expect, test } from 'vitest'
import { groupSummary } from '../summary'
import type { Status } from '../types'

const statuses = (...s: Status[]) => s

test('Paid and Due Soon Members are Paid Up; Exempt Members are not Paying', () => {
  expect(groupSummary(statuses('exempt', 'overdue', 'dueSoon', 'paid', 'paid', 'unknown'), 299)).toEqual({
    paidUp: 3,
    paying: 5,
    pricePerPerson: 59.8,
  })
})

test('with nobody Paying there is no price per person', () => {
  expect(groupSummary(statuses('exempt'), 299)).toEqual({ paidUp: 0, paying: 0, pricePerPerson: null })
})
