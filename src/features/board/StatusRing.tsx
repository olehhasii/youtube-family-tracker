import { motion, useReducedMotion } from 'motion/react'
import type { Status } from '../../model'
import { STATUS_COLOR_TRANSITION, ringDraw } from '../../ui/motion'
import { STATUS_COLOR } from './status-colors'

type Props = {
  /** One Status per Paying Member, in Board order. */
  statuses: { id: string; status: Status }[]
  size: number
  stroke: number
  label: string
}

/** A ring split into one segment per Paying Member, coloured by Status. */
export function StatusRing({ statuses, size, stroke, label }: Props) {
  const reduce = useReducedMotion()
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const n = Math.max(1, statuses.length)
  const gap = statuses.length > 1 ? 0.04 : 0
  const segment = (1 / n - gap) * c

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90" role="img" aria-label={label}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth={stroke} />
      {statuses.map(({ id, status }, i) => (
        <motion.circle
          key={id}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${segment} ${c}`}
          style={{
            rotate: `${(i / n) * 360}deg`,
            transformOrigin: `${size / 2}px ${size / 2}px`,
            stroke: STATUS_COLOR[status],
            transition: STATUS_COLOR_TRANSITION,
          }}
          initial={reduce ? false : { strokeDashoffset: segment }}
          animate={{ strokeDashoffset: 0 }}
          transition={ringDraw(i)}
        />
      ))}
    </svg>
  )
}
