import { motion, useReducedMotion } from 'motion/react'
import type { Status } from '../../../model/types'
import { pillSpring } from '../../../shared/lib/motion'
import { STATUS_COLOR } from '../../../shared/lib/status-colors'

export function StatusPill({ status, text }: { status: Status; text: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.span
      key={status}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      transition={pillSpring}
      className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-white"
      style={{ background: STATUS_COLOR[status] }}
    >
      {text}
    </motion.span>
  )
}
