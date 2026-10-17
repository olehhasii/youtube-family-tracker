import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TOAST_MS } from '../../ui/motion'
import { type Toast, ToastContext, type ToastOptions } from './toast'

let nextId = 0

type Entry = Toast & { onExpire?: ToastOptions['onExpire'] }

/** Holds the island's toast; a newer toast replaces the current one and gets the full time. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Entry | null>(null)
  const [paused, setPaused] = useState(false)
  const current = useRef<Entry | null>(null)
  const remaining = useRef(TOAST_MS)

  /** Ends the current toast; resolves when its `onExpire` has, and rejects if that failed. */
  const end = useCallback(async (expired: boolean) => {
    const ending = current.current
    if (!ending) return
    current.current = null
    setToast(null)
    if (expired) await ending.onExpire?.()
  }, [])
  // the toast's own `onExpire` reports its failure; only `settle` callers need to hear it
  const expire = useCallback(() => void end(true).catch(() => {}), [end])

  const show = useCallback(
    (text: string, { tone = 'done', action, onExpire }: ToastOptions = {}) => {
      expire() // the one it replaces is done
      const entry = { id: ++nextId, text, tone, action, onExpire }
      current.current = entry
      remaining.current = TOAST_MS
      setToast(entry)
    },
    [expire],
  )

  const runAction = useCallback(() => {
    const action = current.current?.action
    void end(false)
    action?.run()
  }, [end])

  // counts down, keeping what is left across pauses; only a toast with an action waits for its reader
  useEffect(() => {
    if (!toast || (paused && toast.action)) return
    const started = Date.now()
    const timer = setTimeout(expire, remaining.current)
    return () => {
      clearTimeout(timer)
      if (current.current?.id === toast.id) remaining.current -= Date.now() - started // a newer toast starts full
    }
  }, [toast, paused, expire])

  const value = useMemo(() => ({ toast, show, settle: () => end(true), runAction, setPaused }), [toast, show, end, runAction])
  return <ToastContext value={value}>{children}</ToastContext>
}
