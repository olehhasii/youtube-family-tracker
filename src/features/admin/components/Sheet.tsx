import { Drawer } from '@base-ui/react/drawer'
import type { ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  /** Runs once the sheet has finished sliding away, for resetting what it showed. */
  onClosed?: () => void
  children: ReactNode
}

/** The bottom sheet every admin action opens in. */
export function Sheet({ open, onClose, onClosed, children }: Props) {
  return (
    <Drawer.Root open={open} onOpenChange={(next) => !next && onClose()} onOpenChangeComplete={(next) => !next && onClosed?.()}>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-100 min-h-dvh bg-shade opacity-[calc(0.6*(1-var(--drawer-swipe-progress)))] transition-opacity duration-450 ease-drawer data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0" />
        <Drawer.Viewport className="fixed inset-0 z-100 flex items-end justify-center">
          <Drawer.Popup className="max-h-[92dvh] w-full max-w-110 overflow-y-auto rounded-t-card border-t border-border bg-card px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-fg outline-none transform-[translateY(var(--drawer-swipe-movement-y))] transition-transform duration-450 ease-drawer data-ending-style:transform-[translateY(100%)] data-starting-style:transform-[translateY(100%)] data-swiping:select-none motion-reduce:transition-opacity motion-reduce:data-ending-style:transform-none motion-reduce:data-ending-style:opacity-0 motion-reduce:data-starting-style:transform-none motion-reduce:data-starting-style:opacity-0">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-fg/20" aria-hidden />
            {children}
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
