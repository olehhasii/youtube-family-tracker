import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { REVEAL_LIMIT_MS, useReveal } from '../use-reveal'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

const HOLD = 750

const render = (dataSettled: boolean, backgroundReady: boolean) =>
  renderHook(({ data, background }) => useReveal(data, background, HOLD), { initialProps: { data: dataSettled, background: backgroundReady } })

const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms))

describe('useReveal', () => {
  test('waits for both the data and the background', () => {
    const { result, rerender } = render(false, false)
    rerender({ data: true, background: false })
    wait(HOLD)
    expect(result.current).toBe(false)
    rerender({ data: true, background: true })
    expect(result.current).toBe(true)
  })

  test('holds after the data settles, however early the background is', () => {
    const { result, rerender } = render(false, true)
    wait(1000)
    rerender({ data: true, background: true })
    wait(HOLD - 1)
    expect(result.current).toBe(false)
    wait(1)
    expect(result.current).toBe(true)
  })

  test('after the limit, settled and held data is enough', () => {
    const { result, rerender } = render(false, false)
    wait(REVEAL_LIMIT_MS)
    rerender({ data: true, background: false })
    expect(result.current).toBe(false)
    wait(HOLD)
    expect(result.current).toBe(true)
  })

  test('never waits past the limit for a background that is late', () => {
    const { result } = render(true, false)
    wait(REVEAL_LIMIT_MS - 1)
    expect(result.current).toBe(false)
    wait(1)
    expect(result.current).toBe(true)
  })

  test('stays revealed', () => {
    const { result, rerender } = render(true, true)
    wait(HOLD)
    rerender({ data: false, background: false })
    expect(result.current).toBe(true)
  })
})
