// Payments the Admin has removed but that are not deleted yet, so the removal can still be undone.
// The Board leaves them out as if they were gone.
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

/** Ids of Payments waiting to be deleted. */
export const useHiddenPayments = () => useSyncExternalStore(subscribe, () => hidden)
