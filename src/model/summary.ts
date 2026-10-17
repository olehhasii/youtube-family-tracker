import type { Status } from './types'

export type GroupSummary = {
  /** Paying Members who are Paid or Due Soon (they have paid for the current month). */
  paidUp: number
  paying: number
  pricePerPerson: number | null
}

export function groupSummary(statuses: Status[], monthlyPrice: number): GroupSummary {
  const paying = statuses.filter((s) => s !== 'exempt').length
  const paidUp = statuses.filter((s) => s === 'paid' || s === 'dueSoon').length
  return { paidUp, paying, pricePerPerson: paying ? monthlyPrice / paying : null }
}
