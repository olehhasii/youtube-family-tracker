import { useEffect, useState } from 'react'

/** How long the page waits for the background before showing up on the CSS fallback. */
export const REVEAL_LIMIT_MS = 2500

/**
 * Whether the page may appear: once the data has settled and held for `holdMs`, and the background has drawn its first
 * frame (or the limit has passed). It never goes back to hidden.
 */
export function useReveal(dataSettled: boolean, backgroundReady: boolean, holdMs: number) {
  const [late, setLate] = useState(false)
  const [held, setHeld] = useState(false)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLate(true), REVEAL_LIMIT_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!dataSettled) return
    const timer = setTimeout(() => setHeld(true), holdMs)
    return () => clearTimeout(timer)
  }, [dataSettled, holdMs])

  if (!revealed && dataSettled && held && (backgroundReady || late)) setRevealed(true)
  return revealed
}
