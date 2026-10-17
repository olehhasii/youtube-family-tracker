// The words a Board row shows for a Standing, in the given language.
import i18n from '../../i18n'
import { type Standing, isDated } from '../../model'
import { type Language, LOCALE, utcDate } from './locale'

export type StandingText = {
  pill: string
  primary: string
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
    primary: t('standing.nextPayment', { date: due }),
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
