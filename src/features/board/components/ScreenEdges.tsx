/**
 * Fades the background into a flat colour at the top and bottom of the screen. Mobile Safari blurs and tints whatever
 * sits under its status bar and toolbar with one colour taken from the page (`--edge`), which shows up as a band over
 * the busy ASCII sky; over a flat edge of that same colour it disappears.
 */
export function ScreenEdges() {
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 lg:hidden h-[calc(env(safe-area-inset-top)+2.5rem)] bg-[linear-gradient(var(--edge)_calc(100%-2.5rem),transparent)]" />
      <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 lg:hidden h-[calc(env(safe-area-inset-bottom)+2.5rem)] bg-[linear-gradient(transparent,var(--edge)_2.5rem)]" />
    </>
  )
}
