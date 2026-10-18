import { useEffect, useState } from 'react'

const TOKENS = ['--bg-top', '--bg-middle', '--bg-bottom', '--bg-glow'] as const
export type Palette = Record<(typeof TOKENS)[number], string>

const read = (): Palette => {
  const style = getComputedStyle(document.documentElement)
  return Object.fromEntries(TOKENS.map((t) => [t, style.getPropertyValue(t).trim()])) as Palette
}

/** The background palette from the CSS tokens, read again when the theme changes. */
export function usePalette() {
  const [palette, setPalette] = useState(read)
  useEffect(() => {
    const observer = new MutationObserver(() => setPalette(read()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])
  return palette
}
