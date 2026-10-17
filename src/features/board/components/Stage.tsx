import type { Board } from '../../../data/board'
import { Cloud } from './Cloud'
import { StageSummary } from './StageSummary'

/** The sky area with the Group summary: above the card on phones, beside it on desktop. The R3F accent (ticket 13) goes here, with the cloud as its fallback. */
export function Stage({ board }: { board: Board | undefined }) {
  return (
    <div className="relative overflow-hidden px-[max(1.25rem,env(safe-area-inset-left))] pt-[calc(2.5rem+env(safe-area-inset-top))] pb-15 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-center lg:overflow-visible lg:px-0 lg:py-16">
      <Cloud className="absolute -right-[45%] -bottom-[145px] w-[95%] lg:top-[60%] lg:right-[-20%] lg:bottom-auto lg:w-full" />
      {board?.group && <StageSummary board={board} group={board.group} />}
    </div>
  )
}
