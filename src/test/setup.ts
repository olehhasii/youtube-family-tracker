import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { MotionGlobalConfig } from 'motion/react'
import { afterEach } from 'vitest'

// Vitest runs without globals, so Testing Library can't clean the DOM between tests on its own.
afterEach(cleanup)

// jsdom can't run animations or measure layout, and shared-layout (layoutId) morphs never finish there.
// Tests check behaviour, so they run the app's reduced-motion path (fades, no morphs); motion is checked in a browser.
MotionGlobalConfig.skipAnimations = true
window.matchMedia = (query: string) =>
  ({
    matches: query === '(prefers-reduced-motion)' || query.includes('prefers-reduced-motion: reduce'), // Motion asks the first form
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList
