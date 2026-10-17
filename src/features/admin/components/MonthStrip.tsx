import { motion, useReducedMotion } from 'motion/react'
import type { Month } from '../../../model/types'
import { monthAt } from '../../../shared/lib/describe-payment'
import { LOCALE, type Language } from '../../../shared/lib/locale'
import { stripFill } from '../../../shared/lib/motion'

type Props = { first: Month; months: number; length: number; lng: Language }

export function MonthStrip({ first, months, length, lng }: Props) {
  const reduce = useReducedMotion()
  const name = new Intl.DateTimeFormat(LOCALE[lng], { month: 'short', timeZone: 'UTC' })
  return (
    <ol className="mt-4 grid grid-cols-6 gap-1.5" aria-hidden>
      {Array.from({ length }, (_, k) => {
        const on = k < months
        return (
          <li key={k} className="relative h-9 overflow-hidden rounded-lg bg-fg/5 text-center text-[11px] leading-9 text-muted">
            <motion.div className="absolute inset-0 origin-left rounded-lg bg-paid/55" initial={false} {...stripFill(reduce, on, k)} />
            <span className={`relative ${on ? 'text-fg' : ''}`}>{name.format(monthAt(first, k)).replace('.', '')}</span>
          </li>
        )
      })}
    </ol>
  )
}
