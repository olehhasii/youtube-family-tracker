import { useTranslation } from 'react-i18next'
import type { Board } from '../../../data/board'
import { useAdmin } from '../../../data/hooks/use-auth'
import { StageSummary } from './StageSummary'

/** The Group summary on the sky: above the card on phones, beside it on desktop. */
export function Stage({ board, onEditGroup }: { board: Board | undefined; onEditGroup: () => void }) {
  const { t } = useTranslation()
  const admin = useAdmin()
  return (
    <div className="relative px-[max(1.25rem,env(safe-area-inset-left))] pt-[calc(2.5rem+env(safe-area-inset-top))] pb-15 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-center lg:px-0 lg:py-16">
      {board?.group && <StageSummary board={board} group={board.group} onEdit={admin ? onEditGroup : undefined} />}
      {board && !board.group && admin && (
        <button className="rounded-full bg-on-sky/15 px-5 py-3 font-semibold text-on-sky press" onClick={onEditGroup}>
          {t('group.setUp')}
        </button>
      )}
    </div>
  )
}
