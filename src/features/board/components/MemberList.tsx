import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BoardRow } from '../../../data/board'
import { useAdmin } from '../../../data/hooks/use-auth'
import { useRemoveLatestPayment } from '../../../data/hooks/use-payments'
import type { Day } from '../../../model/types'
import { describePaymentMonths } from '../../../shared/lib/describe-payment'
import { describeStanding } from '../../../shared/lib/describe-standing'
import { toLanguage } from '../../../shared/lib/locale'
import { rowEntrance, viewExit } from '../../../shared/lib/motion'
import { useToast } from '../../../shared/toast/use-toast'
import { IconPlus } from '../../../shared/ui/icons'
import { DetailCard } from './DetailCard'
import { MemberRow } from './MemberRow'

type Props = {
  rows: BoardRow[]
  today: Day
  onRecord: (memberId: string) => void
  onEdit: (memberId: string) => void
  onAdd: () => void
}

export function MemberList({ rows, today, onRecord, onEdit, onAdd }: Props) {
  const { t, i18n } = useTranslation()
  const lng = toLanguage(i18n.resolvedLanguage)
  const admin = useAdmin()
  const reduce = useReducedMotion()
  const removeLatestPayment = useRemoveLatestPayment()
  const toast = useToast()
  const [openId, setOpenId] = useState<string | null>(null)
  const [returnFocusTo, setReturnFocusTo] = useState<string | null>(null)
  // rows wait for the card on page load; after a detail card closes they return on their own
  const [pageLoad, setPageLoad] = useState(true)
  const opened = rows.find((r) => r.member.id === openId)

  const open = (id: string) => {
    setPageLoad(false)
    setReturnFocusTo(null)
    setOpenId(id)
  }
  const close = () => {
    setReturnFocusTo(openId)
    setOpenId(null)
  }

  const recordFor = (row: BoardRow) => (admin && !row.member.exempt ? () => onRecord(row.member.id) : undefined)

  // gone from the Board at once; deleted when the undo toast ends
  const removeLatest = (row: BoardRow) => {
    const removal = removeLatestPayment(row)
    if (!removal) return
    const { name } = row.member
    toast(t('admin.removed', { name, months: describePaymentMonths(removal.payment, lng) }), {
      action: { label: t('admin.undo'), run: removal.undo },
      onExpire: () =>
        removal.commit().catch((error: unknown) => {
          toast(t('admin.removeFailed', { name }), { tone: 'error' })
          throw error // so a write waiting on this removal doesn't go ahead
        }),
    })
  }

  return (
    // the row ↔ card handoff needs both in one LayoutGroup, or the closing card never leaves
    <LayoutGroup>
      {/* no initial={false}: it would also stop the rows inside from playing their entrance */}
      <AnimatePresence mode="popLayout">
        {opened ? (
          <DetailCard
            key="detail"
            row={opened}
            wording={describeStanding(opened.standing, lng)}
            lng={lng}
            currentYear={Number(today.slice(0, 4))}
            onClose={close}
            onRecord={recordFor(opened)}
            onRemoveLatest={admin ? () => removeLatest(opened) : undefined}
            onEdit={admin ? () => onEdit(opened.member.id) : undefined}
          />
        ) : (
          <motion.ul key="list" className="flex flex-col gap-1.5" exit={{ opacity: 0 }} transition={viewExit}>
            {rows.map((row, i) => (
              <MemberRow
                key={row.member.id}
                row={row}
                wording={describeStanding(row.standing, lng)}
                index={i}
                pageLoad={pageLoad}
                focusOnMount={row.member.id === returnFocusTo}
                onOpen={() => open(row.member.id)}
                onRecord={recordFor(row)}
              />
            ))}
            {admin && (
              <motion.li {...rowEntrance(reduce, rows.length, pageLoad)} className="rounded-row outline-[1.5px] -outline-offset-[1.5px] outline-fg/20 outline-dashed">
                <button className="flex w-full items-center justify-center gap-2 rounded-[inherit] p-4 font-medium text-muted press" onClick={onAdd}>
                  <IconPlus />
                  {t('admin.addMember')}
                </button>
              </motion.li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </LayoutGroup>
  )
}
