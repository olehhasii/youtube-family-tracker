import { motion, useReducedMotion } from 'motion/react'
import type { Status } from '../../model'
import { pillSpring } from '../../ui/motion'
import { STATUS_COLOR } from './status-colors'

/** The coloured Status pill; it springs in again whenever the Status changes. */
export function StatusPill({ status, text }: { status: Status; text: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.span
      key={status}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      transition={pillSpring}
      className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap text-white"
      style={{ background: `color-mix(in srgb, ${STATUS_COLOR[status]} 60%, transparent)` }}
    >
      {text}
    </motion.span>
  )
}
