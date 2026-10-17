/** A calendar month, `YYYY-MM`. */
export type Month = string

/** A local calendar day, `YYYY-MM-DD`. Never a timestamp, so no timezone can move it. */
export type Day = string

export type Member = {
  id: string
  name: string
  exempt: boolean
}

/** A Member paid for `months` whole months starting at `firstMonth`. */
export type Payment = {
  id: string
  memberId: string
  firstMonth: Month
  months: number
  receivedOn: Day
}

export type Status = 'paid' | 'dueSoon' | 'overdue' | 'unknown' | 'exempt'

/** A Member's standing on a given day. Only Members with Payments have a Due Date. */
export type Standing =
  | { status: 'exempt' | 'unknown' }
  | {
      status: 'paid' | 'dueSoon' | 'overdue'
      /** Last Paid Month (shown as "Paid through …"). */
      paidThrough: Month
      /** First day of the first month that is not a Paid Month. */
      dueDate: Day
      /** Calendar days from today to the Due Date; 0 or less means Overdue. */
      daysUntilDue: number
      /** Unpaid months up to and including the current one; 0 unless Overdue. */
      monthsBehind: number
    }
