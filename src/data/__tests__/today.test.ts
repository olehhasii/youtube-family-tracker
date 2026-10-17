import { expect, test } from 'vitest'
import { kyivToday } from '../today'

test('late evening UTC on 31 October is already 1 November in Kyiv', () => {
  expect(kyivToday(new Date('2026-10-31T22:30:00Z'))).toBe('2026-11-01')
})

test('early morning UTC is still the same day in Kyiv', () => {
  expect(kyivToday(new Date('2026-10-17T05:00:00Z'))).toBe('2026-10-17')
})

test('summer time: 21:30 UTC on 30 June is 1 July in Kyiv (UTC+3)', () => {
  expect(kyivToday(new Date('2026-06-30T21:30:00Z'))).toBe('2026-07-01')
})
