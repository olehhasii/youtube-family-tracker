import type { Status } from './types'

const RANK: Record<Status, number> = { exempt: 0, overdue: 1, dueSoon: 2, paid: 3, unknown: 4 }

/** Rows in Board order: Exempt, Overdue, Due Soon, Paid, Unknown. Stable within a Status; returns a new array. */
export function boardOrder<T extends { status: Status }>(rows: T[]): T[] {
  return rows.toSorted((a, b) => RANK[a.status] - RANK[b.status])
}
