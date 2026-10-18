import type { Status } from './types'

export type GroupSummary = {
  /** Paying Members who are Paid or Due Soon (they have paid for the current month). */
  paidUp: number
  paying: number
  /** The monthly price split across every Member; null with no Members. */
  pricePerPerson: number | null
}

export function groupSummary(statuses: Status[], monthlyPrice: number): GroupSummary {
  const paying = statuses.filter((s) => s !== 'exempt').length
  const paidUp = statuses.filter((s) => s === 'paid' || s === 'dueSoon').length
  // everyone holds a share of the plan; an Exempt Member's share is simply covered for them
  return { paidUp, paying, pricePerPerson: statuses.length ? monthlyPrice / statuses.length : null }
}
