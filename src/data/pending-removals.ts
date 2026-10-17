// Payments removed on the Board but not deleted yet, so the removal can still be undone.
import { useSyncExternalStore } from 'react'

let hidden: ReadonlySet<string> = new Set()
const listeners = new Set<() => void>()

function setHidden(next: ReadonlySet<string>) {
  hidden = next
  listeners.forEach((listener) => listener())
}

export const hidePayment = (id: string) => setHidden(new Set(hidden).add(id))

export function showPayment(id: string) {
  const next = new Set(hidden)
  next.delete(id)
  setHidden(next)
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useHiddenPayments = () => useSyncExternalStore(subscribe, () => hidden)
