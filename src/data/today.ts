import type { Day } from '../model'

const kyivDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Kyiv', year: 'numeric', month: '2-digit', day: '2-digit' })

/** Today's date in Kyiv. The database decides "this month" in Kyiv time, so the app must too. */
export function kyivToday(now: Date = new Date()): Day {
  return kyivDate.format(now) // en-CA formats as YYYY-MM-DD
}
