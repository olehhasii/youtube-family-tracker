// The Admin's bottom sheet for recording a Payment: how many months, and which months that covers.
import { Drawer } from '@base-ui/react/drawer'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type BoardRow, useRecordPayment } from '../../data'
import { type Day, type Month, nextPaymentMonths } from '../../model'
import { letterRoll, stripFill } from '../../ui/motion'
import { describePaymentMonths, monthAt } from '../board/describe-payment'
import { LOCALE, type Language, toLanguage } from '../board/locale'
import { useSettleToast, useToast } from '../island/toast'

/** Most months one Payment can cover; the strip shows this many. */
const MAX_MONTHS = 12

type Props = {
  /** The Member to record for; null closes the sheet. */
  row: BoardRow | null
  today: Day
  onClose: () => void
}

export function RecordPaymentSheet({ row, today, onClose }: Props) {
  const { t, i18n } = useTranslation()
  const lng = toLanguage(i18n.resolvedLanguage)
  const [months, setMonths] = useState(1)
  // keep showing the Member while the sheet slides away, after `row` is already null
  const [lastRow, setLastRow] = useState(row)
  if (row && row !== lastRow) setLastRow(row)

  const record = useRecordPayment()
  const toast = useToast()
  const settleToast = useSettleToast()
  const range = lastRow && nextPaymentMonths(lastRow.member, lastRow.payments, today, months)

  const submit = async () => {
    if (!lastRow || !range) return
    const { member } = lastRow
    const covered = describePaymentMonths({ firstMonth: range.first, months }, lng)
    onClose() // the sheet goes at once; the island reports how it went
    try {
      await settleToast() // a removal waiting on its undo toast must reach the database first
    } catch {
      return // it failed and said so; these months were worked out without that Payment
    }
    try {
      await record.mutateAsync({ memberId: member.id, months })
      toast(t('admin.recorded', { name: member.name, months: covered }))
    } catch {
      toast(t('admin.recordFailed', { name: member.name }), { tone: 'error' })
    }
  }

  return (
    <Drawer.Root
      open={row !== null}
      onOpenChange={(open) => !open && onClose()}
      onOpenChangeComplete={(open) => !open && setMonths(1)}
    >
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-100 min-h-dvh bg-black opacity-[calc(0.6*(1-var(--drawer-swipe-progress)))] transition-opacity duration-450 ease-drawer data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0" />
        <Drawer.Viewport className="fixed inset-0 z-100 flex items-end justify-center">
          {/* with reduced motion the sheet fades instead of sliding */}
          <Drawer.Popup className="w-full max-w-110 rounded-t-card border-t border-border bg-card px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-fg outline-none transform-[translateY(var(--drawer-swipe-movement-y))] transition-transform duration-450 ease-drawer data-ending-style:transform-[translateY(100%)] data-starting-style:transform-[translateY(100%)] data-swiping:select-none motion-reduce:transition-opacity motion-reduce:data-ending-style:transform-none motion-reduce:data-ending-style:opacity-0 motion-reduce:data-starting-style:transform-none motion-reduce:data-starting-style:opacity-0">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-fg/20" aria-hidden />
            {lastRow && range && (
              <Drawer.Content>
                <Drawer.Title className="text-lg font-semibold">{t('admin.sheetTitle', { name: lastRow.member.name })}</Drawer.Title>
                <Drawer.Description className="mt-1 text-sm text-muted">{t('admin.sheetHint')}</Drawer.Description>

                <div className="mt-6 flex items-center justify-between rounded-2xl bg-fg/5 p-2">
                  <StepButton label={t('admin.fewer')} disabled={months === 1} onClick={() => setMonths((m) => m - 1)}>
                    −
                  </StepButton>
                  <div className="text-center" aria-live="polite">
                    <RollingCount months={months} />
                    <p className="text-sm text-muted">{describePaymentMonths({ firstMonth: range.first, months }, lng)}</p>
                  </div>
                  <StepButton label={t('admin.more')} disabled={months === MAX_MONTHS} onClick={() => setMonths((m) => m + 1)}>
                    +
                  </StepButton>
                </div>

                <MonthStrip first={range.first} months={months} lng={lng} />

                <button className="mt-6 h-12 w-full rounded-2xl bg-primary font-semibold text-primary-fg press" onClick={() => void submit()}>
                  {t('admin.record', { count: months })}
                </button>
              </Drawer.Content>
            )}
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

function StepButton({ label, ...props }: React.ComponentProps<'button'> & { label: string }) {
  return (
    <button
      className="grid size-11 place-items-center rounded-xl bg-fg/5 text-xl press-round disabled:opacity-30"
      aria-label={label}
      {...props}
    />
  )
}

/** "3 місяці", rolling up when the count changes. */
function RollingCount({ months }: { months: number }) {
  const { t } = useTranslation()
  const roll = letterRoll(useReducedMotion())
  return (
    <div className="relative h-8 overflow-hidden text-2xl font-semibold tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.p key={months} {...roll}>
          {t('admin.months', { count: months })}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

/** The next twelve months from the first unpaid one, filled up to the chosen count. */
function MonthStrip({ first, months, lng }: { first: Month; months: number; lng: Language }) {
  const reduce = useReducedMotion()
  const name = new Intl.DateTimeFormat(LOCALE[lng], { month: 'short', timeZone: 'UTC' })
  return (
    <ol className="mt-4 grid grid-cols-6 gap-1.5" aria-hidden>
      {Array.from({ length: MAX_MONTHS }, (_, k) => {
        const on = k < months
        const month = monthAt(first, k)
        return (
          <li key={k} className="relative h-9 overflow-hidden rounded-lg bg-fg/5 text-center text-[11px] leading-9 text-muted">
            <motion.div className="absolute inset-0 origin-left rounded-lg bg-paid/55" initial={false} {...stripFill(reduce, on, k)} />
            <span className={`relative ${on ? 'text-fg' : ''}`}>{name.format(month).replace('.', '')}</span>
          </li>
        )
      })}
    </ol>
  )
}
