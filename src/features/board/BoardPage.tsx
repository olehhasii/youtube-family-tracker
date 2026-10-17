import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBoard } from '../../data'
import { Island } from '../island/Island'
import { RADIUS, cardEntrance, layoutSpring, viewExit } from '../../ui/motion'
import { DetailCard } from './DetailCard'
import { describeStanding } from './describe-standing'
import { LOCALE, toLanguage } from './locale'
import { MemberRow } from './MemberRow'
import { StatusRing } from './StatusRing'

export function BoardPage() {
  const { t, i18n } = useTranslation()
  const lng = toLanguage(i18n.resolvedLanguage)
  const reduce = useReducedMotion()
  const board = useBoard()
  const [openId, setOpenId] = useState<string | null>(null)
  const [returnFocusTo, setReturnFocusTo] = useState<string | null>(null) // the row whose card just closed

  const open = (id: string) => {
    setReturnFocusTo(null)
    setOpenId(id)
  }
  const close = () => {
    setReturnFocusTo(openId)
    setOpenId(null)
  }

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
    </div>
  )
}
