import { useEffect, useState } from 'react'

const ARMED_MS = 4000

type Props = { label: string; confirmLabel: string; onConfirm: () => void }

/** A destructive button that asks again on the first press and acts on the second; it calms down after a few seconds. */
export function ConfirmButton({ label, confirmLabel, onConfirm }: Props) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), ARMED_MS)
    return () => clearTimeout(timer)
  }, [armed])

  return (
    <button
      type="button"
      className={`min-h-12 w-full rounded-full px-4 py-2 font-semibold press ${armed ? 'bg-overdue text-on-status' : 'text-overdue hover-fine:bg-overdue/10'}`}
      aria-live="polite"
      onClick={() => (armed ? onConfirm() : setArmed(true))}
    >
      {armed ? confirmLabel : label}
    </button>
  )
}
