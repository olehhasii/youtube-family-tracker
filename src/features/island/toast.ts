// Toasts show in the island. Anything under ToastProvider can raise one with `useToast()`.
import { createContext, use } from 'react'

export type Toast = { id: number; text: string }

export const ToastContext = createContext<{ toast: Toast | null; show: (text: string) => void } | null>(null)

function useToastContext() {
  const context = use(ToastContext)
  if (!context) throw new Error('Toasts need a ToastProvider above them')
  return context
}

/** Shows a short message in the island for `TOAST_MS`. */
export const useToast = () => useToastContext().show

/** The toast on screen now, if any. */
export const useCurrentToast = () => useToastContext().toast
