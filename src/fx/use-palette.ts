import { useEffect, useState } from 'react'

export type Palette = { ramp: string[]; fill: number; glyphGain: number; glyphLight: number }

const read = (): Palette => {
  const style = getComputedStyle(document.documentElement)
  return {
    ramp: style.getPropertyValue('--bg-ramp').trim().split(/\s+/),
    fill: Number(style.getPropertyValue('--bg-fill')) || 1,
    glyphGain: Number(style.getPropertyValue('--bg-glyph-gain')) || 1,
    glyphLight: Number(style.getPropertyValue('--bg-glyph-light')) || 0.55,
  }
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
