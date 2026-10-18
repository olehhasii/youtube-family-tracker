import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { REVEAL_LIMIT_MS, useReveal } from '../use-reveal'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

const render = (dataSettled: boolean, backgroundReady: boolean) =>
  renderHook(({ data, background }) => useReveal(data, background), { initialProps: { data: dataSettled, background: backgroundReady } })

describe('useReveal', () => {
  test('waits for both the data and the background', () => {
    const { result, rerender } = render(false, false)
    rerender({ data: true, background: false })
    expect(result.current).toBe(false)
    rerender({ data: true, background: true })
    expect(result.current).toBe(true)
  })

  test('after the limit, settled data is enough', () => {
    const { result, rerender } = render(false, false)
    act(() => vi.advanceTimersByTime(REVEAL_LIMIT_MS))
    expect(result.current).toBe(false)
    rerender({ data: true, background: false })
    expect(result.current).toBe(true)
  })

  test('never waits past the limit for a background that is late', () => {
    const { result } = render(true, false)
    expect(result.current).toBe(false)
    act(() => vi.advanceTimersByTime(REVEAL_LIMIT_MS))
    expect(result.current).toBe(true)
  })

  test('stays revealed', () => {
    const { result, rerender } = render(true, true)
    rerender({ data: false, background: false })
    expect(result.current).toBe(true)
  })
})
