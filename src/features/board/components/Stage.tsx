import type { Board } from '../../../data/board'
import { StageSummary } from './StageSummary'

/** The Group summary on the sky: above the card on phones, beside it on desktop. */
export function Stage({ board }: { board: Board | undefined }) {
  return (
    <div className="relative px-[max(1.25rem,env(safe-area-inset-left))] pt-[calc(2.5rem+env(safe-area-inset-top))] pb-15 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-center lg:px-0 lg:py-16">
      {board?.group && <StageSummary board={board} group={board.group} />}
    </div>
  )
}
