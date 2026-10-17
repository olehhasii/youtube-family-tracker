import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import App from '../App'
import { toBoard } from '../data/board'
import '../i18n'

// Stand in for the network only; mapping, ordering and rendering are real.
vi.mock('../data/queries', () => ({
  fetchBoard: async () =>
    toBoard(
      {
        group: { id: true, name: 'Family Premium', monthly_price: 299, currency: 'UAH' },
        members: [{ id: 'm1', name: 'Sasha', slug: 'sasha', exempt: false, position: 1, avatar_path: null, created_at: '' }],
        payments: [],
      },
      '2026-10-17',
    ),
}))

test('renders the Board from the data layer, in Ukrainian by default', async () => {
  render(<App />)
  expect(await screen.findByText('Family Premium')).toBeInTheDocument()
  expect(screen.getByText('Sasha')).toBeInTheDocument()
  expect(screen.getByText('Невідомо')).toBeInTheDocument()
})
