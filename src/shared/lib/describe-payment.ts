import i18n from '../../i18n/index'
import type { Payment } from '../../model/types'
import { type Language, LOCALE, utcDate } from './locale'

/** The month `offset` months after `firstMonth`, as UTC midnight on its 1st. */
export function monthAt(firstMonth: string, offset: number) {
  const d = utcDate(firstMonth)
  d.setUTCMonth(d.getUTCMonth() + offset)
  return d
}

/** "травень – липень 2026", "October 2026", "December 2026 – January 2027". */
export function describePaymentMonths(payment: Pick<Payment, 'firstMonth' | 'months'>, lng: Language): string {
  const name = new Intl.DateTimeFormat(LOCALE[lng], { month: 'long', timeZone: 'UTC' })
  const first = monthAt(payment.firstMonth, 0)
  const last = monthAt(payment.firstMonth, payment.months - 1)
  const [y1, y2] = [first.getUTCFullYear(), last.getUTCFullYear()]
  if (payment.months === 1) return `${name.format(first)} ${y1}`
  if (y1 === y2) return `${name.format(first)} – ${name.format(last)} ${y2}`
  return `${name.format(first)} ${y1} – ${name.format(last)} ${y2}`
}

/** "отримано 3 травня", with the year added when it isn't `currentYear`. */
export function describeReceived(payment: Payment, lng: Language, currentYear: number): string {
  const received = utcDate(payment.receivedOn)
  const withYear = received.getUTCFullYear() !== currentYear
  const date = new Intl.DateTimeFormat(LOCALE[lng], { day: 'numeric', month: 'long', ...(withYear && { year: 'numeric' }), timeZone: 'UTC' })
  // uk adds " р." after a year; the history reads better without it
  return i18n.getFixedT(lng)('detail.received', { date: date.format(received).replace(/ р\.$/, '') })
}
