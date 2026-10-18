// Motion presets. Values are defined in CLAUDE.md ("Motion"); change them there first.
// Presets use the `y`/`scale` shorthands rather than transform strings so they compose with `layout` animations.
// Each preset takes `reduce` (from `useReducedMotion()`) and falls back to opacity only.
import type { Transition } from 'motion/react'

export const EASE_OUT = [0.23, 1, 0.32, 1] as const

/** Row ↔ detail card, card resize. */
export const layoutSpring: Transition = { type: 'spring', duration: 0.5, bounce: 0.12 }

/** Island changing shape between rest, menu and toast. */
export const islandSpring: Transition = { type: 'spring', duration: 0.45, bounce: 0.2 }

/** The island rising in first, as a small pill, once the Group name has set off for the stage; it widens at `REVEAL.islandGrow`. */
export function islandEntrance(reduce: boolean | null) {
  return {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 160 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: reduce
      ? reducedReveal
      : { y: { type: 'spring', duration: 0.5, bounce: 0.3, delay: REVEAL.island }, default: { duration: 0.2, ease: EASE_OUT, delay: REVEAL.island } } satisfies Transition,
  }
}

/** The pill the island rises as, before it widens (px). */
export const ISLAND_PILL = { width: 44, height: 30 } as const

/** The island's contents popping in once it has widened, one after another. */
export function islandPop(reduce: boolean | null, index: number) {
  return {
    initial: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.1, filter: 'blur(20px)' },
    animate: reduce ? { opacity: 1 } : { opacity: 1, scale: 1, filter: 'blur(0px)' },
    transition: reduce ? reducedReveal : { duration: 0.3, ease: EASE_OUT, delay: REVEAL.islandContent + index * 0.05 },
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

/** Loader glyphs: how often they scramble, how long they take to resolve into the Group name, and how long the name holds before it leaves for the stage (ms). */
export const GLYPH_TICK_MS = 60
export const DECODE_MS = 500
export const DECODE_HOLD_MS = 250

/** The loader holds at least this long after the data is ready (ms), its decode included. */
export const LOADER_MIN_MS = 1500

/**
 * The page reveal, in seconds after the loader hands the Group name to the stage (it glides there with `layoutSpring`)
 * and the sky starts decoding outwards (`SKY_INTRO_S`): the island rises as a pill, widens and fills (its ring draws
 * once its contents land); only once its last button has popped in do the stage's stats rise, then the card and its rows.
 */
const ISLAND = { island: 0.15, islandGrow: 0.45, islandContent: 0.6 }
const ISLAND_DONE = ISLAND.islandContent + 3 * 0.05 + 0.3 // the fourth pop's delay plus its length (`islandPop`)
export const REVEAL = { ...ISLAND, stage: ISLAND_DONE, card: ISLAND_DONE + 0.15, rows: ISLAND_DONE + 0.25 } as const

/** The sky decoding outwards from the centre at the hand-off, in seconds; the CSS fallback fades in over the same time. */
export const SKY_INTRO_S = 1.1
export const skyIntro: Transition = { duration: SKY_INTRO_S, ease: EASE_OUT }

/** Under reduced motion the whole reveal, sky included, fades in at once. */
export const reducedReveal: Transition = { duration: 0.3, ease: EASE_OUT }

/** The card's page-load entrance: it springs up from well below while its blur clears. */
export function cardEntrance(reduce: boolean | null) {
  return {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 240, filter: 'blur(10px)' },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: reduce
      ? reducedReveal
      : { y: { type: 'spring', duration: 0.6, bounce: 0.2, delay: REVEAL.card }, default: { duration: 0.3, ease: EASE_OUT, delay: REVEAL.card } } satisfies Transition,
  }
}
export const STAGGER = 0.07

/**
 * Board rows entering: on page load they follow the card from far below, heavily blurred, `STAGGER` apart; when a
 * detail card closes they return lightly, on their own.
 */
export function rowEntrance(reduce: boolean | null, index: number, pageLoad: boolean) {
  if (reduce) return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { ...reducedReveal, layout: layoutSpring } }
  const [hidden, timing] = pageLoad
    ? [{ opacity: 0, y: 120, filter: 'blur(20px)' }, { duration: 0.35, delay: REVEAL.rows + index * STAGGER }]
    : [{ opacity: 0, y: 12, filter: 'blur(6px)' }, { duration: 0.45, delay: 0.15 + index * 0.05 }]
  return {
    initial: hidden,
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { ...timing, ease: EASE_OUT, layout: layoutSpring },
  }
}

/** The stage's count and stats rising in behind the Group name as it lands. */
export function stageEntrance(reduce: boolean | null, index: number) {
  return {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24, filter: 'blur(12px)' },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: reduce ? reducedReveal : { duration: 0.45, ease: EASE_OUT, delay: REVEAL.stage + index * STAGGER },
  }
}

/** A status ring drawing its segments after what holds it lands; `after` is that holder's own delay. */
export const ringDraw = (index: number, after = 0): Transition => ({ duration: 0.8, ease: EASE_OUT, delay: after + 0.3 + index * STAGGER })

/** A view leaving while another takes its place (list ↔ detail card). */
export const viewExit: Transition = { duration: 0.15, ease: EASE_OUT }

/** Content inside a card that has just grown, fading in once the card has mostly settled. */
export const settledContentFade: Transition = { delay: 0.15, duration: 0.25, ease: EASE_OUT }

/** The background effect fading in over its CSS fallback when it missed the page reveal. Opacity only, so it needs no reduced variant. */
export const backgroundLateFade: Transition = { duration: 0.6, ease: EASE_OUT }

/** CSS transition for a colour that follows a Status change. */
export const STATUS_COLOR_TRANSITION = 'stroke 250ms ease, color 250ms ease'

/** Corner radii as numbers, for elements whose radius Motion must keep correct during layout animations (match src/index.css). */
export const RADIUS = { card: 28, detail: 24, row: 20, island: 26 } as const

/** How long a toast stays in the island, in ms. */
export const TOAST_MS = 2600
