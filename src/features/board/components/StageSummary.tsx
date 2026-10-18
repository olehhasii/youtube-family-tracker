import { motion, useReducedMotion } from 'motion/react'
import { type ReactNode, useId } from 'react'
import { useTranslation } from 'react-i18next'
import type { Board } from '../../../data/board'
import { LOCALE, toLanguage } from '../../../shared/lib/locale'
import { layoutSpring, stageEntrance } from '../../../shared/lib/motion'
import { IconPencil } from '../../../shared/ui/icons'
import { GROUP_NAME_LAYOUT_ID, GROUP_NAME_TYPE, ON_SKY_SHADOW } from '../helpers/group-name'

type Props = { board: Board; group: NonNullable<Board['group']>; onEdit?: () => void }

export function StageSummary({ board: { rows, summary }, group, onEdit }: Props) {
  const { t, i18n } = useTranslation()
  const lng = toLanguage(i18n.resolvedLanguage)
  const reduce = useReducedMotion()
  const title = useId()
  // the narrow symbol (₴, $, €) instead of the Latin code, placed the way each language writes it: "299 ₴", "₴299"
  const money = (amount: number, digits: number) =>
    new Intl.NumberFormat(LOCALE[lng], { style: 'currency', currency: group.currency, currencyDisplay: 'narrowSymbol', minimumFractionDigits: 0, maximumFractionDigits: digits }).format(amount)

  return (
    <section data-fx-calm aria-labelledby={title} className={`relative text-on-sky ${ON_SKY_SHADOW}`}>
      <motion.p {...stageEntrance(reduce, 0)} className="text-[12.5px] font-medium opacity-80">
        {t('stage.members', { count: rows.length })}
      </motion.p>
      <div className="mt-1 flex items-center gap-2">
        {/* arrives from the loader, which decoded its glyphs into this name */}
        <motion.h1
          id={title}
          layoutId={reduce ? undefined : GROUP_NAME_LAYOUT_ID}
          initial={reduce ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={layoutSpring}
          className={`min-w-0 ${GROUP_NAME_TYPE}`}
        >
          {group.name}
        </motion.h1>
        {onEdit && (
          // the motion lives on a wrapper: an inline transform on the button would override its press scale
          <motion.span {...stageEntrance(reduce, 1)} className="shrink-0">
            <button className="grid size-9 place-items-center rounded-full bg-on-sky/15 press-round" aria-label={t('group.edit')} onClick={onEdit}>
              <IconPencil />
            </button>
          </motion.span>
        )}
      </div>
      <dl className="mt-3 flex gap-3.5 lg:mt-6 lg:flex-col lg:gap-4">
        <Stat label={t('stage.paidUp')} big={summary.paying > 0} index={1}>
          {summary.paying ? (
            <>
              {summary.paidUp}
              <span className="opacity-75">/{summary.paying}</span>
            </>
          ) : (
            t('stage.nobodyPays')
          )}
        </Stat>
        <Stat label={t('stage.perMonth')} index={2}>
          {money(group.monthlyPrice, 2)}
          {summary.pricePerPerson !== null && ` · ≈${money(summary.pricePerPerson, 0)}`}
        </Stat>
      </dl>
    </section>
  )
}

function Stat({ label, big = false, index, children }: { label: string; big?: boolean; index: number; children: ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <motion.div {...stageEntrance(reduce, index)} className="min-w-0 flex-1 border-t-2 border-dotted border-on-sky/45 pt-2 lg:max-w-md lg:flex-none">
      <dt className="text-[12.5px] font-medium opacity-80">{label}</dt>
      <dd className={`mt-1 ${big ? 'font-display text-[22px] leading-none font-bold tracking-[-0.03em] lg:text-[28px]' : 'text-[13px] leading-snug font-bold lg:text-sm'}`}>
        {children}
      </dd>
    </motion.div>
  )
}
