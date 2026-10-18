import { AnimatePresence, motion } from 'motion/react'
import { viewExit } from '../shared/lib/motion'

/** A plain screen over the page until it is revealed; ticket 21 replaces it with a designed loader. */
export function Curtain({ shown }: { shown: boolean }) {
  return (
    <AnimatePresence>
      {shown && <motion.div aria-hidden className="z-105 screen-overhang bg-[var(--bg-top)]" exit={{ opacity: 0 }} transition={viewExit} />}
    </AnimatePresence>
  )
}
