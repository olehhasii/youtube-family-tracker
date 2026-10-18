import { useEffect, useState } from 'react'
import { DECODE_HOLD_MS, DECODE_MS, GLYPH_TICK_MS } from '../../../shared/lib/motion'

/** The background's glyphs, faintest first. */
export const GLYPHS = '·:+*oO@'
const POOL = 64

const randomGlyphs = () => Array.from({ length: POOL }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)])

/**
 * Glyphs scrambling while `target` is undefined, then resolving into it left to right. `glyphs[i]` is what an
 * unresolved letter shows; letters before `resolved` are settled. `done` comes after the settled text has held for a
 * beat, or at once when there is nothing to resolve into (null) or motion is reduced.
 */
export function useGlyphDecode(target: string | null | undefined, still: boolean) {
  const [glyphs, setGlyphs] = useState(() => Array.from({ length: POOL }, (_, i) => GLYPHS[i % GLYPHS.length]))
  const [elapsed, setElapsed] = useState<number | null>(null) // ms since decoding began
  const decoding = typeof target === 'string' && !still
  const total = DECODE_MS + DECODE_HOLD_MS
  const done = target === null || (typeof target === 'string' && (still || (elapsed ?? 0) >= total))

  useEffect(() => {
    if (still || done) return
    const start = performance.now()
    const timer = setInterval(() => {
      setGlyphs(randomGlyphs())
      if (decoding) setElapsed(performance.now() - start)
    }, GLYPH_TICK_MS)
    return () => clearInterval(timer)
  }, [still, done, decoding])

  const length = typeof target === 'string' ? target.length : 0
  const resolved = still ? length : Math.min(length, Math.floor(((elapsed ?? 0) / DECODE_MS) * length))
  return { glyphs, resolved, done }
}
