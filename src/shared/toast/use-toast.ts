import { createContext, use } from 'react'

export type ToastOptions = {
  /** `done` (green ✓) unless something failed. */
  tone?: 'done' | 'error'
  /** A button in the toast, such as Undo. Using it ends the toast without `onExpire`. */
  action?: { label: string; run: () => void }
  /** Runs when the toast ends any other way: its time ran out, a newer toast replaced it, or it was settled early. */
  onExpire?: () => void | Promise<void>
}

export type Toast = { id: number; text: string; tone: NonNullable<ToastOptions['tone']>; action?: ToastOptions['action'] }

type ToastContextValue = {
  toast: Toast | null
  show: (text: string, options?: ToastOptions) => void
  /** Ends the current toast now as if its time ran out; waits for its `onExpire` and rejects if that failed. */
  settle: () => Promise<void>
  runAction: () => void
  /** Holds the timer while someone is reading or reaching the toast. */
  setPaused: (paused: boolean) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

function useToastContext() {
  const context = use(ToastContext)
  if (!context) throw new Error('Toasts need a ToastProvider above them')
  return context
}

export const useToast = () => useToastContext().show

/** Settles the current toast early, e.g. so a pending removal is done before the next write. */
export const useSettleToast = () => useToastContext().settle

export const useIslandToast = () => {
  const { toast, runAction, setPaused } = useToastContext()
  return { toast, runAction, setPaused }
}
