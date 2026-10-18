import { useSyncExternalStore } from 'react'
import { currentTheme } from '../helpers/theme'

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

export function useTheme() {
  return useSyncExternalStore(subscribe, currentTheme)
}
