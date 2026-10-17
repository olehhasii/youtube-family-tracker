import type { Status } from './types'

export type GroupSummary = {
  /** Paying Members who are Paid or Due Soon (they have paid for the current month). */
  paidUp: number
  /** Members who are not Exempt. */
  paying: number
  /** The monthly price split between Paying Members; null when nobody pays. */
  pricePerPerson: number | null
}

export function groupSummary(statuses: Status[], monthlyPrice: number): GroupSummary {
  const paying = statuses.filter((s) => s !== 'exempt').length
  const paidUp = statuses.filter((s) => s === 'paid' || s === 'dueSoon').length
  return { paidUp, paying, pricePerPerson: paying ? monthlyPrice / paying : null }
}
