import { expect, test } from 'vitest'
import { boardOrder } from '../board-order'
import type { Status } from '../types'

const row = (name: string, status: Status) => ({ name, status })

test('Board order is Exempt, Overdue, Due Soon, Paid, Unknown, keeping input order within a Status', () => {
  const rows = [
    row('Kate', 'unknown'),
    row('Ira', 'paid'),
    row('Sasha', 'overdue'),
    row('Max', 'paid'),
    row('Dima', 'dueSoon'),
    row('Oleh', 'exempt'),
    row('Lena', 'overdue'),
  ]
  expect(boardOrder(rows).map((r) => r.name)).toEqual(['Oleh', 'Sasha', 'Lena', 'Dima', 'Ira', 'Max', 'Kate'])
})

test('the input list is left untouched', () => {
  const rows = [row('Kate', 'unknown'), row('Oleh', 'exempt')]
  boardOrder(rows)
  expect(rows.map((r) => r.name)).toEqual(['Kate', 'Oleh'])
})
