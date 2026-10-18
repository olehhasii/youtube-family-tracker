import { Drawer } from '@base-ui/react/drawer'
import { type ComponentProps, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BoardRow } from '../../data/board'
import { useRecordPayment } from '../../data/hooks/use-payments'
import { nextPaymentMonths } from '../../model/payments'
import type { Day } from '../../model/types'
import { describePaymentMonths } from '../../shared/lib/describe-payment'
import { toLanguage } from '../../shared/lib/locale'
import { useSettleToast, useToast } from '../../shared/toast/use-toast'
import { MonthStrip } from './components/MonthStrip'
import { RollingCount } from './components/RollingCount'
import { Sheet } from './components/Sheet'

const MAX_MONTHS = 12

type Props = {
  /** null closes the sheet. */
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
    <Sheet open={row !== null} onClose={onClose} onClosed={() => setMonths(1)}>
      {lastRow && range && (
        <Drawer.Content>
          <Drawer.Title className="font-display text-lg font-bold tracking-[-0.02em]">{t('admin.sheetTitle', { name: lastRow.member.name })}</Drawer.Title>
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

          <MonthStrip first={range.first} months={months} length={MAX_MONTHS} lng={lng} />

          <button className="mt-6 h-12 w-full rounded-full bg-primary font-semibold text-primary-fg press" onClick={() => void submit()}>
            {t('admin.record', { count: months })}
          </button>
        </Drawer.Content>
      )}
    </Sheet>
  )
}

function StepButton({ label, ...props }: ComponentProps<'button'> & { label: string }) {
  return (
    <button
      className="grid size-11 place-items-center rounded-xl bg-fg/5 text-xl press-round disabled:opacity-30"
      aria-label={label}
      {...props}
    />
  )
}
