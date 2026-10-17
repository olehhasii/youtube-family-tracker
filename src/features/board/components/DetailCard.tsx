import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { BoardRow } from '../../../data/board'
import { isDated } from '../../../model/types'
import { Avatar } from '../../../shared/ui/Avatar'
import { RADIUS, layoutSpring, settledContentFade, viewExit } from '../../../shared/lib/motion'
import { describePaymentMonths, describeReceived } from '../../../shared/lib/describe-payment'
import type { StandingText } from '../../../shared/lib/describe-standing'
import { memberLayoutId } from '../helpers/layout-ids'
import type { Language } from '../../../shared/lib/locale'
import { STATUS_COLOR } from '../../../shared/lib/status-colors'

type Props = {
  row: BoardRow
  wording: StandingText
  lng: Language
  currentYear: number
  onClose: () => void
  onRecord?: () => void
  onRemoveLatest?: () => void
}

export function DetailCard({ row: { member, standing, payments }, wording, lng, currentYear, onClose, onRecord, onRemoveLatest }: Props) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => close.current?.focus(), []) // keyboard and screen-reader users land inside the card
  const monthsTotal = payments.reduce((sum, p) => sum + p.months, 0)

  return (
    <motion.section
      layoutId={memberLayoutId(member.id, '', reduce)}
      initial={reduce ? { opacity: 0 } : undefined}
      animate={reduce ? { opacity: 1 } : undefined}
      exit={{ opacity: 0 }} // without an exit of its own the card never leaves when its row takes over
      transition={{ ...layoutSpring, opacity: viewExit }}
      aria-label={member.name}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      className="overflow-hidden bg-raised/60 p-4"
      style={{ borderRadius: RADIUS.detail }}
    >
      <div className="flex items-center gap-3">
        <motion.div layoutId={memberLayoutId(member.id, '-avatar', reduce)} transition={layoutSpring}>
          <Avatar id={member.id} name={member.name} url={member.avatarUrl} size={56} />
        </motion.div>
        <div className="min-w-0 flex-1">
          <motion.h2 layoutId={memberLayoutId(member.id, '-name', reduce)} transition={layoutSpring} className="w-fit text-xl font-semibold">
            {member.name}
          </motion.h2>
          <p className="text-sm" style={{ color: STATUS_COLOR[standing.status] }}>
            {wording.pill}
          </p>
        </div>
        <button ref={close} className="rounded-full bg-fg/10 px-3 py-1.5 text-sm press" onClick={onClose}>
          {t('detail.close')}
        </button>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={settledContentFade}>
        {!isDated(standing) ? (
          <p className="mt-4 text-sm text-muted">{t(standing.status === 'exempt' ? 'detail.exempt' : 'detail.noPayments')}</p>
        ) : (
          <>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-2xl bg-page/40 p-3">
                <dt className="text-muted">{t('detail.nextPayment')}</dt>
                <dd className="mt-1 font-medium">{wording.dueDate}</dd>
                <dd style={{ color: STATUS_COLOR[standing.status] }}>{wording.relative}</dd>
              </div>
              <div className="rounded-2xl bg-page/40 p-3">
                <dt className="text-muted">{t('detail.covered')}</dt>
                <dd className="mt-1 font-medium">{wording.paidThrough}</dd>
                <dd className="text-muted">{t('detail.monthsTotal', { count: monthsTotal })}</dd>
              </div>
            </dl>

            <h3 className="sr-only">{t('detail.history')}</h3>
            <ol className="mt-3 flex flex-col">
              {payments.map((p, i) => (
                <li key={p.id} className="flex items-center justify-between gap-3 border-t border-border py-2.5 text-sm">
                  <span>{describePaymentMonths(p, lng)}</span>
                  <span className="flex items-center gap-3 text-muted">
                    {describeReceived(p, lng, currentYear)}
                    {/* newest first, so the first is the latest */}
                    {onRemoveLatest && i === 0 && (
                      <button
                        className="text-overdue press"
                        aria-label={t('admin.removeLabel', { months: describePaymentMonths(p, lng) })}
                        onClick={onRemoveLatest}
                      >
                        {t('admin.remove')}
                      </button>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}
        {onRecord && (
          <button className="mt-3 h-12 w-full rounded-2xl bg-primary font-semibold text-primary-fg press" onClick={onRecord}>
            {t('admin.recordPayment')}
          </button>
        )}
      </motion.div>
    </motion.section>
  )
}
