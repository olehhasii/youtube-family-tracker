import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { letterRoll } from '../../../shared/lib/motion'

export function RollingCount({ months }: { months: number }) {
  const { t } = useTranslation()
  const roll = letterRoll(useReducedMotion())
  return (
    <div className="relative h-8 overflow-hidden text-2xl font-semibold tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.p key={months} {...roll}>
          {t('admin.months', { count: months })}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
