import { motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { cardEntrance } from '../../ui/motion'

// Empty Board shell; rows, ring and detail card arrive with ticket 07.
export function BoardPage() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  return (
    <div className="flex min-h-dvh items-start justify-center px-safe pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(9rem+env(safe-area-inset-bottom))] sm:items-center sm:pt-10">
      <motion.main {...cardEntrance(reduce)} className="w-full max-w-[360px] rounded-card border border-border bg-card p-4">
        <p className="px-1 py-6 text-center text-sm text-muted">{t('board.empty')}</p>
      </motion.main>
    </div>
  )
}
