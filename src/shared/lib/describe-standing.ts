import i18n from '../../i18n/index'
import { type Standing, isDated } from '../../model/types'
import { type Language, LOCALE, utcDate } from './locale'

export type StandingText = {
  pill: string
  /** The line shown instead of a Due Date ("Covers the plan", "No payments yet"); null when there is one, as the row sets "Next payment · <date>" itself with the date in bold. */
  primary: string | null
  /** The Due Date alone, "1 November"; null without Payments. */
  dueDate: string | null
  /** "in 15 days" / "3 days late" / "due today"; null without a Due Date. */
  relative: string | null
  /** "Paid through October"; null without Payments. */
  paidThrough: string | null
}

export function describeStanding(standing: Standing, lng: Language): StandingText {
  const t = i18n.getFixedT(lng)
  if (!isDated(standing)) {
    return { pill: t(`status.${standing.status}`), primary: t(`standing.${standing.status}`), dueDate: null, relative: null, paidThrough: null }
  }

  const { dueDate, daysUntilDue, monthsBehind, paidThrough } = standing
  const due = new Intl.DateTimeFormat(LOCALE[lng], { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(utcDate(dueDate))
  const month = new Intl.DateTimeFormat(LOCALE[lng], { month: 'long', timeZone: 'UTC' }).format(utcDate(paidThrough))

  return {
    pill: monthsBehind > 1 ? t('standing.monthsBehind', { count: monthsBehind }) : t(`status.${standing.status}`),
    primary: null,
    dueDate: due,
    relative:
      daysUntilDue === 0
        ? t('standing.dueToday')
        : daysUntilDue > 0
          ? t('standing.inDays', { count: daysUntilDue })
          : t('standing.daysLate', { count: -daysUntilDue }),
    paidThrough: t('standing.paidThrough', { month }),
  }
}
