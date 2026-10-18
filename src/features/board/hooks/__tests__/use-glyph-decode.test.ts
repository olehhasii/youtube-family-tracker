import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { DECODE_HOLD_MS, DECODE_MS, GLYPH_TICK_MS } from '../../../../shared/lib/motion'
import { GLYPHS, useGlyphDecode } from '../use-glyph-decode'

beforeEach(() => vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'performance'] }))
afterEach(() => vi.useRealTimers())

const render = (target: string | null | undefined, still = false) =>
  renderHook(({ target, still }) => useGlyphDecode(target, still), { initialProps: { target, still } })

describe('useGlyphDecode', () => {
  test('scrambles glyphs while the target is unknown', () => {
    const { result } = render(undefined)
    act(() => vi.advanceTimersByTime(GLYPH_TICK_MS * 3))
    expect(result.current.done).toBe(false)
    expect(result.current.resolved).toBe(0)
    expect(result.current.glyphs.every((g) => GLYPHS.includes(g))).toBe(true)
  })

  test('resolves into the target letter by letter, then holds before it is done', () => {
    const { result, rerender } = render(undefined)
    rerender({ target: 'Family', still: false })
    act(() => vi.advanceTimersByTime(DECODE_MS / 2))
    expect(result.current.resolved).toBeGreaterThan(0)
    expect(result.current.resolved).toBeLessThan(6)
    act(() => vi.advanceTimersByTime(DECODE_MS / 2 + GLYPH_TICK_MS))
    expect(result.current.resolved).toBe(6)
    expect(result.current.done).toBe(false)
    act(() => vi.advanceTimersByTime(DECODE_HOLD_MS))
    expect(result.current.done).toBe(true)
  })

  test('is done at once with nothing to resolve into', () => {
    expect(render(null).result.current.done).toBe(true)
  })

  test('under reduced motion the target is settled at once', () => {
    const { result } = render('Family', true)
    expect(result.current).toMatchObject({ resolved: 6, done: true })
  })
})
