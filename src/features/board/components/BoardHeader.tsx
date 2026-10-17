import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import type { Board, BoardRow } from '../../../data/board'
import type { GroupSummary } from '../../../model/summary'
import { LOCALE, toLanguage } from '../../../shared/lib/locale'
import { StatusRing } from '../../../shared/ui/StatusRing'

type Props = { group: NonNullable<Board['group']>; rows: BoardRow[]; summary: GroupSummary }

export function BoardHeader({ group, rows, summary }: Props) {
  const { t, i18n } = useTranslation()
  const price = new Intl.NumberFormat(LOCALE[toLanguage(i18n.resolvedLanguage)], { maximumFractionDigits: 2 }).format(group.monthlyPrice)
  const paying = rows.filter((r) => r.standing.status !== 'exempt')

  return (
    <motion.header layout="position" className="flex items-center gap-4 px-1 pt-1 pb-4">
      <StatusRing
        statuses={paying.map((r) => ({ id: r.member.id, status: r.standing.status }))}
        size={56}
        stroke={6}
        label={t('board.ringLabel', { paidUp: summary.paidUp, paying: summary.paying })}
      />
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-[-0.01em]">{group.name}</h1>
        <p className="text-sm text-muted">
          {summary.paying
            ? t('board.summary', { paidUp: summary.paidUp, paying: summary.paying, price, currency: group.currency })
            : t('board.summaryNobodyPays', { price, currency: group.currency })}
        </p>
      </div>
    </motion.header>
  )
}
