import { addMonths, monthOf } from './calendar'
import type { Day, Member, Month, Payment } from './types'

// Paid Months are a single unbroken run (ADR 0001), so a Member's latest Payment always ends the run.
// Public functions take the whole ledger plus the Member, and only ever look at that Member's Payments.

function latestOf(member: Member, payments: Payment[]): Payment | null {
  return payments
    .filter((p) => p.memberId === member.id)
    .reduce<Payment | null>((a, b) => (a && a.firstMonth > b.firstMonth ? a : b), null)
}

export function lastPaidMonth(member: Member, payments: Payment[]): Month | null {
  const last = latestOf(member, payments)
  return last && addMonths(last.firstMonth, last.months - 1)
}

/** The months a new Payment of `count` months would cover: it continues from the Member's first unpaid month. */
export function nextPaymentMonths(member: Member, payments: Payment[], today: Day, count: number): { first: Month; last: Month } {
  if (!Number.isInteger(count) || count < 1) throw new RangeError(`A Payment covers whole months, at least 1 (got ${count})`)
  const through = lastPaidMonth(member, payments)
  const first = through ? addMonths(through, 1) : monthOf(today)
  return { first, last: addMonths(first, count - 1) }
}

/** The only Payment that may be deleted: the Member's latest, since deleting another would leave a gap. */
export function deletablePayment(member: Member, payments: Payment[]): Payment | null {
  return latestOf(member, payments)
}
