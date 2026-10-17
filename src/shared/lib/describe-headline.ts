import i18n from '../../i18n/index'
import { type Standing, isDated } from '../../model/types'
import { describeStanding } from './describe-standing'
import type { Language } from './locale'

export type Headline = { label: string; text: string }

export function describeHeadline(rows: { name: string; standing: Standing }[], lng: Language): Headline {
  const t = i18n.getFixedT(lng)
  // soonest Due Date first, so an Overdue one comes first and the furthest behind leads
  const [first] = rows
    .flatMap(({ name, standing }) => (isDated(standing) ? [{ name, standing }] : []))
    .toSorted((a, b) => a.standing.daysUntilDue - b.standing.daysUntilDue)

  if (!first) return { label: t('island.payments'), text: t('island.noneRecorded') }

  const { monthsBehind } = first.standing
  const wording = describeStanding(first.standing, lng)
  if (first.standing.status === 'overdue') {
    const howFar = monthsBehind > 1 ? t('island.months', { count: monthsBehind }) : wording.relative
    return { label: t('island.behind'), text: `${first.name} · ${howFar}` }
  }
  return { label: t('island.nextPayment'), text: wording.dueDate! }
}
