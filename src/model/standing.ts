import { addMonths, daysBetween, firstDayOf, monthIndex, monthOf } from './calendar'
import { lastPaidMonth } from './payments'
import type { Day, Member, Payment, Standing } from './types'

/** A Member is Due Soon when the Due Date is this many days away or fewer. */
const DUE_SOON_DAYS = 7

export function standing(member: Member, payments: Payment[], today: Day): Standing {
  if (member.exempt) return { status: 'exempt' }
  const paidThrough = lastPaidMonth(member, payments)
  if (!paidThrough) return { status: 'unknown' }

  const dueDate = firstDayOf(addMonths(paidThrough, 1))
  const daysUntilDue = daysBetween(today, dueDate)
  if (daysUntilDue <= 0) {
    // the current month is unpaid too, so it counts as a month behind
    const monthsBehind = monthIndex(monthOf(today)) - monthIndex(paidThrough)
    return { status: 'overdue', paidThrough, dueDate, daysUntilDue, monthsBehind }
  }
  const status = daysUntilDue <= DUE_SOON_DAYS ? 'dueSoon' : 'paid'
  return { status, paidThrough, dueDate, daysUntilDue, monthsBehind: 0 }
}
