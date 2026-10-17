import { motion, useReducedMotion } from 'motion/react'
import { type ReactNode, useId } from 'react'
import { useTranslation } from 'react-i18next'
import type { Board } from '../../../data/board'
import { describeHeadline } from '../../../shared/lib/describe-headline'
import { LOCALE, toLanguage } from '../../../shared/lib/locale'
import { cardEntrance } from '../../../shared/lib/motion'

export function StageSummary({ board: { rows, summary }, group }: { board: Board; group: NonNullable<Board['group']> }) {
  const { t, i18n } = useTranslation()
  const lng = toLanguage(i18n.resolvedLanguage)
  const reduce = useReducedMotion()
  const title = useId()
  const paying = rows.filter((r) => r.standing.status !== 'exempt')
  const headline = describeHeadline(
    paying.map((r) => ({ name: r.member.name, standing: r.standing })),
    lng,
  )
  const money = (amount: number, digits: number) =>
    `${new Intl.NumberFormat(LOCALE[lng], { maximumFractionDigits: digits }).format(amount)} ${group.currency}`

  return (
    <motion.section aria-labelledby={title} {...cardEntrance(reduce)} className="relative text-on-sky [text-shadow:0_2px_24px_rgb(10_60_100/0.3)]">
      <p className="text-[12.5px] font-medium opacity-80">{t('stage.members', { count: rows.length })}</p>
      <h1 id={title} className="mt-1 font-display text-[clamp(26px,7.5vw,34px)] leading-tight font-bold tracking-[-0.03em] lg:text-[clamp(34px,3.6vw,56px)]">
        {group.name}
      </h1>
      <dl className="mt-4 flex gap-3.5 lg:mt-12 lg:flex-col lg:gap-4">
        <Stat label={t('stage.paidUp')} big={summary.paying > 0}>
          {summary.paying ? (
            <>
              {summary.paidUp}
              <span className="opacity-75">/{summary.paying}</span>
            </>
          ) : (
            t('stage.nobodyPays')
          )}
        </Stat>
        <Stat label={headline.label}>{headline.text}</Stat>
        <Stat label={t('stage.perMonth')}>
          {money(group.monthlyPrice, 2)}
          {summary.pricePerPerson !== null && ` · ≈${money(summary.pricePerPerson, 0)}`}
        </Stat>
      </dl>
    </motion.section>
  )
}

function Stat({ label, big = false, children }: { label: string; big?: boolean; children: ReactNode }) {
  return (
    <div className="min-w-0 flex-1 border-t-2 border-dotted border-on-sky/45 pt-2 lg:max-w-md lg:flex-none">
      <dt className="text-[12.5px] font-medium opacity-80">{label}</dt>
      <dd className={`mt-1 ${big ? 'font-display text-[22px] leading-none font-bold tracking-[-0.03em] lg:text-[28px]' : 'text-[13px] leading-snug font-bold lg:text-sm'}`}>
        {children}
      </dd>
    </div>
  )
}
