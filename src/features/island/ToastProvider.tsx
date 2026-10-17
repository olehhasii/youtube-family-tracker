import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { TOAST_MS } from '../../ui/motion'
import { type Toast, ToastContext } from './toast'

let nextId = 0

/** Holds the island's toast; a newer toast replaces the current one and gets the full time. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null)
  const show = useCallback((text: string) => setToast({ id: ++nextId, text }), [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), TOAST_MS)
    return () => clearTimeout(timer)
  }, [toast])

  const value = useMemo(() => ({ toast, show }), [toast, show])
  return <ToastContext value={value}>{children}</ToastContext>
}
