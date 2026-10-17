import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BoardRow } from '../../data/board'
import { useAdmin } from '../../data/hooks/use-auth'
import { useBoard } from '../../data/hooks/use-board'
import { useRemoveLatestPayment } from '../../data/hooks/use-payments'
import { RecordPaymentSheet } from '../admin/RecordPaymentSheet'
import { Island } from '../island/Island'
import { useToast } from '../../shared/toast/use-toast'
import { describePaymentMonths } from '../../shared/lib/describe-payment'
import { RADIUS, cardEntrance, layoutSpring, viewExit } from '../../shared/lib/motion'
import { DetailCard } from './components/DetailCard'
import { describeStanding } from '../../shared/lib/describe-standing'
import { LOCALE, toLanguage } from '../../shared/lib/locale'
import { MemberRow } from './components/MemberRow'
import { StatusRing } from '../../shared/ui/StatusRing'

export function BoardPage() {
  const { t, i18n } = useTranslation()
  const lng = toLanguage(i18n.resolvedLanguage)
  const reduce = useReducedMotion()
  const board = useBoard()
  const admin = useAdmin()
  const removeLatestPayment = useRemoveLatestPayment()
  const toast = useToast()
  const [openId, setOpenId] = useState<string | null>(null)
  const [recordingId, setRecordingId] = useState<string | null>(null)
  const [returnFocusTo, setReturnFocusTo] = useState<string | null>(null)

  const open = (id: string) => {
    setReturnFocusTo(null)
    setOpenId(id)
  }
  const close = () => {
    setReturnFocusTo(openId)
    setOpenId(null)
  }

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

  const recordFor = (row: BoardRow) => (admin && !row.member.exempt ? () => setRecordingId(row.member.id) : undefined)

  const message = (text: string) => <p className="px-1 py-6 text-center text-sm text-muted">{text}</p>

  let content
  if (board.isPending) content = message(t('board.loading'))
  else if (board.isError) content = message(t('board.error'))
  else if (!board.data.group || board.data.rows.length === 0) content = message(t('board.empty'))
  else {
    const { group, rows, summary, today } = board.data
    const opened = rows.find((r) => r.member.id === openId)
    const price = new Intl.NumberFormat(LOCALE[lng], { maximumFractionDigits: 2 }).format(group.monthlyPrice)
    content = (
      <>
        <motion.header layout="position" className="flex items-center gap-4 px-1 pt-1 pb-4">
          <StatusRing
            statuses={rows.filter((r) => r.standing.status !== 'exempt').map((r) => ({ id: r.member.id, status: r.standing.status }))}
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

        {/* the row ↔ card handoff needs both in one LayoutGroup, or the closing card never leaves */}
        <LayoutGroup>
          <AnimatePresence mode="popLayout" initial={false}>
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
              />
            ) : (
              <motion.ul key="list" className="flex flex-col gap-1.5" exit={{ opacity: 0 }} transition={viewExit}>
                {rows.map((row, i) => (
                  <MemberRow
                    key={row.member.id}
                    row={row}
                    wording={describeStanding(row.standing, lng)}
                    index={i}
                    focusOnMount={row.member.id === returnFocusTo}
                    onOpen={() => open(row.member.id)}
                    onRecord={recordFor(row)}
                  />
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </>
    )
  }

  const entrance = cardEntrance(reduce)
  return (
    <div className="flex min-h-dvh items-start justify-center px-safe pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(9rem+env(safe-area-inset-bottom))] sm:items-center sm:pt-10">
      <motion.main
        layout={!reduce}
        {...entrance}
        transition={{ ...entrance.transition, layout: layoutSpring }}
        className="w-full max-w-90 border border-border bg-card p-4"
        style={{ borderRadius: RADIUS.card }} // inline so Motion can correct it while the card resizes
      >
        {content}
      </motion.main>
      <Island board={board.data} />
      {board.data && (
        <RecordPaymentSheet
          row={(admin && board.data.rows.find((r) => r.member.id === recordingId)) || null} // closes if the session ends
          today={board.data.today}
          onClose={() => setRecordingId(null)}
        />
      )}
    </div>
  )
}
