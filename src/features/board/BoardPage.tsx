import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { useAdmin } from '../../data/hooks/use-auth'
import { useBoard } from '../../data/hooks/use-board'
import { RADIUS, cardEntrance, layoutSpring } from '../../shared/lib/motion'
import { RecordPaymentSheet } from '../admin/RecordPaymentSheet'
import { Island } from '../island/Island'
import { BoardBody } from './components/BoardBody'

export function BoardPage() {
  const reduce = useReducedMotion()
  const board = useBoard()
  const admin = useAdmin()
  const [recordingId, setRecordingId] = useState<string | null>(null)
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
        <BoardBody board={board} onRecord={setRecordingId} />
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
