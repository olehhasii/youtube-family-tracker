import { AnimatePresence, motion } from 'motion/react'
import { viewExit } from '../shared/lib/motion'

/** A plain screen over the page until it is revealed; ticket 21 replaces it with a designed loader. */
export function Curtain({ shown }: { shown: boolean }) {
  return (
    <AnimatePresence>
      {shown && <motion.div aria-hidden className="fixed inset-x-0 top-0 z-105 h-lvh bg-[var(--bg-top)]" exit={{ opacity: 0 }} transition={viewExit} />}
    </AnimatePresence>
  )
}
