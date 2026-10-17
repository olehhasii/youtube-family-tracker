// Motion presets. Values are defined in CLAUDE.md ("Motion"); change them there first.
// Presets use the `y`/`scale` shorthands rather than transform strings so they compose with `layout` animations.
// Each preset takes `reduce` (from `useReducedMotion()`) and falls back to opacity only.
import type { Transition } from 'motion/react'

export const EASE_OUT = [0.23, 1, 0.32, 1] as const

/** Row ↔ detail card, card resize. */
export const layoutSpring: Transition = { type: 'spring', duration: 0.5, bounce: 0.12 }

/** Island changing shape between rest, menu and toast. */
export const islandSpring: Transition = { type: 'spring', duration: 0.45, bounce: 0.2 }

/** Status pill swapping to a new Status. */
export const pillSpring: Transition = { type: 'spring', duration: 0.4, bounce: 0.25 }

/** Cross-fade for content swapping inside the island. */
export function islandContentSwap(reduce: boolean | null) {
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(4px)', scale: 0.96 }
  const shown = reduce ? { opacity: 1 } : { opacity: 1, filter: 'blur(0px)', scale: 1 }
  return { initial: hidden, animate: shown, exit: hidden, transition: { duration: 0.2, ease: EASE_OUT } }
}

/** The page-load entrance; rows follow with `STAGGER` seconds between them. */
export function cardEntrance(reduce: boolean | null) {
  return {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24, filter: 'blur(8px)' },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.5, ease: EASE_OUT },
  }
}
export const STAGGER = 0.05

/** How long a toast stays in the island, in ms. */
export const TOAST_MS = 2600
