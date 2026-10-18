import { useEffect, useState } from 'react'

/** How long the page waits for the background before showing up on the CSS fallback. */
export const REVEAL_LIMIT_MS = 2500

/**
 * Whether the page may appear: once the data has settled and the background has drawn its first frame, or once the data
 * has settled after the limit. It never goes back to hidden.
 */
export function useReveal(dataSettled: boolean, backgroundReady: boolean) {
  const [late, setLate] = useState(false)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLate(true), REVEAL_LIMIT_MS)
    return () => clearTimeout(timer)
  }, [])

  if (!revealed && dataSettled && (backgroundReady || late)) setRevealed(true)
  return revealed
}
