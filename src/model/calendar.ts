import type { Day, Month } from './types'

const pad = (n: number) => String(n).padStart(2, '0')

/** Months since year 0, so months can be added and compared as numbers. */
export function monthIndex(m: Month): number {
  const [y, mm] = m.split('-').map(Number)
  return y * 12 + (mm - 1)
}

export function monthAt(index: number): Month {
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`
}

export const addMonths = (m: Month, n: number): Month => monthAt(monthIndex(m) + n)

export const monthOf = (d: Day): Month => d.slice(0, 7)

export const firstDayOf = (m: Month): Day => `${m}-01`

/** Whole calendar days from `a` to `b` (negative when `b` is earlier). */
export function daysBetween(a: Day, b: Day): number {
  const utc = (d: Day) => {
    const [y, m, dd] = d.split('-').map(Number)
    return Date.UTC(y, m - 1, dd)
  }
  return (utc(b) - utc(a)) / 86_400_000
}
