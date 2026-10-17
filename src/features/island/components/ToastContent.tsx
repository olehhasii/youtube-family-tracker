import type { Toast } from '../../../shared/toast/use-toast'
import { IconCheck, IconCross } from '../../../shared/ui/icons'

export function ToastContent({ toast, onAction }: { toast: Toast; onAction: () => void }) {
  return (
    <>
      <span className={`grid size-10 shrink-0 place-items-center rounded-full text-black ${toast.tone === 'error' ? 'bg-overdue' : 'bg-paid'}`}>
        {toast.tone === 'error' ? <IconCross /> : <IconCheck />}
      </span>
      {/* the island's live region announces it */}
      <span className="min-w-0 truncate" aria-hidden>
        {toast.text}
      </span>
      {toast.action && (
        <button data-autofocus className="h-10 shrink-0 rounded-full bg-white/10 px-4 font-medium press" onClick={onAction}>
          {toast.action.label}
        </button>
      )}
    </>
  )
}
