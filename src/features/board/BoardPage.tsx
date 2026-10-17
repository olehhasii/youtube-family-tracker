import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { useAdmin } from '../../data/hooks/use-auth'
import { useBoard } from '../../data/hooks/use-board'
import { RADIUS, cardEntrance, layoutSpring } from '../../shared/lib/motion'
import { RecordPaymentSheet } from '../admin/RecordPaymentSheet'
import { Island } from '../island/Island'
import { BoardBody } from './components/BoardBody'
import { Stage } from './components/Stage'

export function BoardPage() {
  const reduce = useReducedMotion()
  const board = useBoard()
  const admin = useAdmin()
  const [recordingId, setRecordingId] = useState<string | null>(null)
  const entrance = cardEntrance(reduce)

  return (
    <div className="relative min-h-dvh lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div aria-hidden className="grass fixed inset-x-0 bottom-0 h-24" />
      <Stage board={board.data} />
      <div className="relative -mt-12 flex justify-center px-safe pb-[calc(9rem+env(safe-area-inset-bottom))] lg:mt-0 lg:min-h-dvh lg:items-center lg:px-[clamp(1.5rem,4vw,4rem)] lg:pt-16">
        <motion.main
          layout={!reduce}
          {...entrance}
          transition={{ ...entrance.transition, layout: layoutSpring }}
          className="w-full max-w-150 bg-card p-4 shadow-card lg:max-w-[clamp(600px,36vw,780px)]"
          style={{ borderRadius: RADIUS.card }} // inline so Motion can correct it while the card resizes
        >
          <BoardBody board={board} onRecord={setRecordingId} />
        </motion.main>
      </div>
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
