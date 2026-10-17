import { type FocusEvent, useLayoutEffect, useRef } from 'react'

/**
 * Moves focus to the new content's `[data-autofocus]` when the island's content swaps under the user's focus,
 * or when a toast's action (Undo) can take focus that its own cause just lost (e.g. a removed history row).
 */
export function useIslandFocus({ viewKey, shown, hasAction }: { viewKey: string; shown: string; hasAction: boolean }) {
  const root = useRef<HTMLElement>(null)
  // A focused button removed with its content may or may not blur, so only a blur from a still-mounted
  // element counts as focus leaving the island.
  const focusWithin = useRef(false)
  const lastViewKey = useRef(viewKey)
  const focusOnEnter = useRef<string | null>(null)

  const focusInto = (panel: Element) => {
    panel.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    focusOnEnter.current = null
  }

  // The entering panel may mount a commit later (AnimatePresence), so the island holds focus until `onEnter`.
  useLayoutEffect(() => {
    if (lastViewKey.current === viewKey) return
    lastViewKey.current = viewKey
    const island = root.current
    const active = document.activeElement
    const lost = active === document.body
    const wasHere = focusWithin.current && (lost || !!island?.contains(active))
    const reachAction = shown === 'toast' && hasAction && lost
    if (!island || (!wasHere && !reachAction)) return
    island.focus()
    focusOnEnter.current = shown
    const entered = island.querySelector(`[data-panel="${shown}"]`)
    if (entered) focusInto(entered)
  }, [viewKey, shown, hasAction])

  return {
    root,
    onEnter: (name: string, panel: HTMLElement) => {
      if (focusOnEnter.current === name) focusInto(panel)
    },
    onFocus: () => {
      focusWithin.current = true
    },
    onBlur: (e: FocusEvent<HTMLElement>) => {
      const target = e.target as HTMLElement
      if (!e.currentTarget.contains(e.relatedTarget) && target.isConnected && !target.closest('[inert]')) focusWithin.current = false
    },
  }
}
