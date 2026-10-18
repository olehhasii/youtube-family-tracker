import { motion, useReducedMotion } from 'motion/react'
import type { Status } from '../../../model/types'
import { STATUS_COLOR_TRANSITION, ringDraw } from '../../../shared/lib/motion'
import { STATUS_COLOR } from '../../../shared/lib/status-colors'

const SIZE = 56
const STROKE = 3

/** A full ring in the Member's Status colour around a 46px avatar; dashed while there are no Payments. */
export function AvatarRing({ status, index, after }: { status: Status; index: number; after: number }) {
  const reduce = useReducedMotion()
  const r = (SIZE - STROKE) / 2
  const c = 2 * Math.PI * r
  return (
    <svg aria-hidden width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="pointer-events-none absolute -inset-[5px] -rotate-90">
      {status === 'unknown' ? (
        <circle cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" strokeWidth={STROKE} strokeDasharray="3 4" style={{ stroke: STATUS_COLOR.unknown }} />
      ) : (
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={r}
          fill="none"
          strokeWidth={STROKE}
          strokeDasharray={`${c} ${c}`}
          style={{ stroke: STATUS_COLOR[status], transition: STATUS_COLOR_TRANSITION }}
          initial={reduce ? false : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: 0 }}
          transition={ringDraw(index, after)}
        />
      )}
    </svg>
  )
}
