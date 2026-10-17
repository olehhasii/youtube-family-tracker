import { expect, test } from 'vitest'
import type { Payment } from '../../../model'
import { describePaymentMonths, describeReceived } from '../describe-payment'

const pay = (firstMonth: string, months: number, receivedOn = `${firstMonth}-03`): Payment => ({
  id: 'p',
  memberId: 'm',
  firstMonth,
  months,
  receivedOn,
})

test('one month, a run within a year, and a run across New Year', () => {
  expect(describePaymentMonths(pay('2026-10', 1), 'uk')).toBe('жовтень 2026')
  expect(describePaymentMonths(pay('2026-05', 3), 'uk')).toBe('травень – липень 2026')
  expect(describePaymentMonths(pay('2026-12', 2), 'uk')).toBe('грудень 2026 – січень 2027')
  expect(describePaymentMonths(pay('2026-05', 3), 'en')).toBe('May – July 2026')
})

test('the received date shows the year only when it is not the current one', () => {
  expect(describeReceived(pay('2026-05', 1), 'uk', 2026)).toBe('отримано 3 травня')
  expect(describeReceived(pay('2025-12', 1), 'uk', 2026)).toBe('отримано 3 грудня 2025')
  expect(describeReceived(pay('2025-12', 1), 'en', 2026)).toBe('received 3 December 2025')
})
