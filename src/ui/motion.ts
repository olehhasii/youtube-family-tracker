// Motion presets. Values are defined in CLAUDE.md ("Motion"); change them there first.
// Presets use the `y`/`scale` shorthands rather than transform strings so they compose with `layout` animations.
// Each preset takes `reduce` (from `useReducedMotion()`) and falls back to opacity only.
import type { Transition } from 'motion/react'

export const EASE_OUT = [0.23, 1, 0.32, 1] as const

/** Row ↔ detail card, card resize. */
export const layoutSpring: Transition = { type: 'spring', duration: 0.5, bounce: 0.12 }

/** Island changing shape between rest, menu and toast. */
export const islandSpring: Transition = { type: 'spring', duration: 0.45, bounce: 0.2 }

/** The island rising in once the card has landed. */
export function islandEntrance(reduce: boolean | null) {
  return {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 40 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: { ...islandSpring, delay: 0.4 },
  }
}

/** Letters rolling up when a short label changes (UA ↔ EN). */
export function letterRoll(reduce: boolean | null) {
  return {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 10 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: -10 },
    transition: { duration: 0.2, ease: EASE_OUT },
  }
}

/** One cell of the record-payment month strip filling (or emptying) from the left; cells follow each other. */
export function stripFill(reduce: boolean | null, on: boolean, index: number) {
  return {
    animate: reduce ? { opacity: on ? 1 : 0 } : { scaleX: on ? 1 : 0 },
    transition: { duration: 0.25, ease: EASE_OUT, delay: on ? index * 0.03 : 0 },
  }
}

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

/** Board rows following the card in on page load. */
export function rowEntrance(reduce: boolean | null, index: number) {
  return {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 12, filter: 'blur(6px)' },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.45, ease: EASE_OUT, delay: 0.15 + index * STAGGER, layout: layoutSpring },
  }
}

/** The status ring drawing its segments after the card lands. */
export const ringDraw = (index: number): Transition => ({ duration: 0.8, ease: EASE_OUT, delay: 0.3 + index * STAGGER })

/** A view leaving while another takes its place (list ↔ detail card). */
export const viewExit: Transition = { duration: 0.15, ease: EASE_OUT }

/** Content inside a card that has just grown, fading in once the card has mostly settled. */
export const settledContentFade: Transition = { delay: 0.15, duration: 0.25, ease: EASE_OUT }

/** CSS transition for a colour that follows a Status change. */
export const STATUS_COLOR_TRANSITION = 'stroke 250ms ease, color 250ms ease'

/** Corner radii as numbers, for elements whose radius Motion must keep correct during layout animations (match src/index.css). */
export const RADIUS = { card: 28, detail: 20, row: 14, island: 26 } as const

/** How long a toast stays in the island, in ms. */
export const TOAST_MS = 2600
