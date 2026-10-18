import { motion, useReducedMotion } from 'motion/react'
import { useCallback, useState } from 'react'
import { useAdmin } from '../../data/hooks/use-auth'
import { useBoard } from '../../data/hooks/use-board'
import { Background } from '../../fx/Background'
import { Curtain } from '../../fx/Curtain'
import { useReveal } from '../../fx/use-reveal'
import { RADIUS, cardEntrance, layoutSpring } from '../../shared/lib/motion'
import { GroupSheet } from '../admin/GroupSheet'
import { MemberSheet } from '../admin/MemberSheet'
import { RecordPaymentSheet } from '../admin/RecordPaymentSheet'
import { Island } from '../island/Island'
import { BoardBody } from './components/BoardBody'
import { ScreenEdges } from './components/ScreenEdges'
import { Stage } from './components/Stage'

export function BoardPage() {
  const reduce = useReducedMotion()
  const board = useBoard()
  const admin = useAdmin()
  const [recordingId, setRecordingId] = useState<string | null>(null)
  // a Member's id, or 'new' to add one
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingGroup, setEditingGroup] = useState(false)
  const entrance = cardEntrance(reduce)
  const [backgroundReady, setBackgroundReady] = useState(false)
  const onBackgroundReady = useCallback(() => setBackgroundReady(true), [])
  // the page-load moment plays once, so the page waits behind the curtain for its data and its background
  const revealed = useReveal(!board.isPending, backgroundReady)

  return (
    <div className="relative min-h-dvh lg:grid lg:grid-cols-[minmax(0,30rem)_minmax(0,40rem)] lg:justify-center lg:gap-[clamp(3rem,6vw,7rem)] lg:px-12">
      <Background revealed={revealed} onReady={onBackgroundReady} />
      <ScreenEdges />
      {revealed && (
        <>
          <Stage board={board.data} onEditGroup={() => setEditingGroup(true)} />
          <div className="relative -mt-12 flex justify-center px-safe pb-[calc(6rem+env(safe-area-inset-bottom))] lg:mt-0 lg:min-h-dvh lg:items-center lg:px-0 lg:pt-16">
            <motion.main
              layout={!reduce}
              {...entrance}
              transition={{ ...entrance.transition, layout: layoutSpring }}
              className="w-full max-w-150 bg-card p-4 shadow-card lg:max-w-none"
              style={{ borderRadius: RADIUS.card }} // inline so Motion can correct it while the card resizes
            >
              <BoardBody board={board} onRecord={setRecordingId} onEdit={setEditingId} onAdd={() => setEditingId('new')} />
            </motion.main>
          </div>
          <Island board={board.data} />
        </>
      )}
      <Curtain shown={!revealed} />
      {board.data && (
        <>
          {/* each closes if the session ends */}
          <RecordPaymentSheet
            row={(admin && board.data.rows.find((r) => r.member.id === recordingId)) || null}
            today={board.data.today}
            onClose={() => setRecordingId(null)}
          />
          <MemberSheet
            target={admin ? (editingId === 'new' ? 'new' : board.data.rows.find((r) => r.member.id === editingId) || null) : null}
            members={board.data.rows.map((r) => r.member)}
            today={board.data.today}
            onClose={() => setEditingId(null)}
          />
          <GroupSheet open={admin && editingGroup} group={board.data.group} onClose={() => setEditingGroup(false)} />
        </>
      )}
    </div>
  )
}
