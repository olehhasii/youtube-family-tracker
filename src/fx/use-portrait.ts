import { useSyncExternalStore } from 'react'

const query = () => window.matchMedia('(orientation: portrait)')
const subscribe = (onChange: () => void) => {
  const list = query()
  list.addEventListener('change', onChange)
  return () => list.removeEventListener('change', onChange)
}

export function usePortrait() {
  return useSyncExternalStore(subscribe, () => query().matches)
}
