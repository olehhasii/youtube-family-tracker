export type Theme = 'dark' | 'light'

// index.html reads the same key before first paint, so a saved light theme never flashes dark
export const THEME_KEY = 'theme'
const THEME_COLOR: Record<Theme, string> = { dark: '#040102', light: '#1a84c4' }

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function apply(theme: Theme) {
  const root = document.documentElement
  if (theme === 'light') root.dataset.theme = 'light'
  else delete root.dataset.theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
  document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', theme)
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // private mode or blocked storage: the choice lasts for this visit only
  }
}

/** Switches the theme, cross-fading the whole page where View Transitions exist (CLAUDE.md "Motion"). */
export function setTheme(theme: Theme, reduce: boolean) {
  if (reduce || !document.startViewTransition) return apply(theme)
  // the update must not wait for frames: rendering is paused until it returns. The new side of the transition is
  // live, so the background canvas repaints in the new palette while the page fades.
  document.startViewTransition(() => apply(theme))
}
