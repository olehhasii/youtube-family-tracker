import { motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useBoard } from '../../data'
import { cardEntrance } from '../../ui/motion'

// Interim Board from real data; the designed rows, ring and detail card arrive with ticket 07.
export function BoardPage() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const board = useBoard()

  return (
    <div className="flex min-h-dvh items-start justify-center px-safe pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(9rem+env(safe-area-inset-bottom))] sm:items-center sm:pt-10">
      <motion.main {...cardEntrance(reduce)} className="w-full max-w-[360px] rounded-card border border-border bg-card p-4">
        {board.isPending ? (
          <p className="px-1 py-6 text-center text-sm text-muted">{t('board.loading')}</p>
        ) : board.isError ? (
          <p className="px-1 py-6 text-center text-sm text-muted">{t('board.error')}</p>
        ) : !board.data.group || board.data.rows.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-muted">{t('board.empty')}</p>
        ) : (
          <>
            <h1 className="px-1 pb-3 text-xl font-semibold">{board.data.group.name}</h1>
            <ul className="flex flex-col gap-1.5">
              {board.data.rows.map(({ member, standing }) => (
                <li key={member.id} className="flex items-center justify-between rounded-row bg-raised/60 px-3 py-2.5">
                  <span className="font-medium">{member.name}</span>
                  <span className="text-sm text-muted">{t(`status.${standing.status}`)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </motion.main>
    </div>
  )
}
