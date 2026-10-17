import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { toBoard } from '../../../data/board'
import { fetchBoard } from '../../../data/queries'
import '../../../i18n'
import { renderWithProviders } from '../../../test/render'
import { BoardPage } from '../BoardPage'

// Stand in for the network only; mapping, rules and rendering are real.
vi.mock('../../../data/queries', () => ({ fetchBoard: vi.fn() }))

const member = (slug: string, position: number, exempt = false) => ({
  id: `id-${slug}`,
  name: slug[0].toUpperCase() + slug.slice(1),
  slug,
  exempt,
  position,
  avatar_path: null,
  created_at: '',
})
const payment = (slug: string, firstMonth: string, months: number) => ({
  id: `${slug}-${firstMonth}`,
  member_id: `id-${slug}`,
  first_month: `${firstMonth}-01`,
  months,
  received_on: `${firstMonth}-03`,
  created_at: '',
})

const board = toBoard(
  {
    group: { id: true, name: 'Family Premium', monthly_price: 299, currency: 'UAH' },
    members: [member('oleh', 0, true), member('sasha', 1), member('ira', 2)],
    payments: [payment('sasha', '2026-02', 3), payment('sasha', '2026-05', 3), payment('ira', '2026-09', 6)],
  },
  '2026-10-17',
)

beforeEach(() => {
  vi.mocked(fetchBoard).mockReset()
})

describe('BoardPage', () => {
  test('lists Members in Board order with their next payment and status', async () => {
    vi.mocked(fetchBoard).mockResolvedValue(board)
    renderWithProviders(<BoardPage />)

    const rows = await screen.findAllByRole('listitem')
    expect(rows.map((r) => within(r).getByRole('button', { name: /./ }).textContent)).toEqual([
      expect.stringContaining('Oleh'),
      expect.stringContaining('Sasha'),
      expect.stringContaining('Ira'),
    ])
    expect(within(rows[1]).getByText('Наступний платіж · 1 серпня')).toBeInTheDocument()
    expect(within(rows[1]).getByText('прострочено на 77 днів')).toBeInTheDocument()
    expect(within(rows[1]).getByText('Прострочено 3 місяці')).toBeInTheDocument()
    expect(screen.getByText('Family Premium')).toBeInTheDocument()
    expect(screen.getByText('Сплачено 1 з 2 · 299 UAH на місяць')).toBeInTheDocument()
  })

  test("tapping a Member opens their details and history; Close goes back", async () => {
    vi.mocked(fetchBoard).mockResolvedValue(board)
    const user = userEvent.setup()
    renderWithProviders(<BoardPage />)

    await user.click(await screen.findByRole('button', { name: /Sasha/ }))

    const detail = await screen.findByRole('region', { name: 'Sasha' })
    expect(within(detail).getByText('Сплачено по липень')).toBeInTheDocument()
    expect(within(detail).getByText('6 місяців загалом')).toBeInTheDocument()
    const history = within(detail).getAllByRole('listitem').map((li) => li.textContent)
    expect(history).toEqual([expect.stringContaining('травень – липень 2026'), expect.stringContaining('лютий – квітень 2026')])

    await user.click(within(detail).getByRole('button', { name: 'Закрити' }))
    // the card shrinks back into its row over a few frames; wait for the settled state
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Sasha' })).not.toBeInTheDocument()
      expect(screen.getAllByRole('button', { name: /Ira/ })).toHaveLength(1)
    })
  })

  test('keyboard: opening moves focus into the card, Escape closes it and focus returns to the row', async () => {
    vi.mocked(fetchBoard).mockResolvedValue(board)
    const user = userEvent.setup()
    renderWithProviders(<BoardPage />)

    await user.click(await screen.findByRole('button', { name: /Sasha/ }))
    const detail = await screen.findByRole('region', { name: 'Sasha' })
    expect(within(detail).getByRole('button', { name: 'Закрити' })).toHaveFocus()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.getByRole('button', { name: /Sasha/ })).toHaveFocus())
  })

  test('with nobody paying, the summary says so instead of "0 of 0"', async () => {
    vi.mocked(fetchBoard).mockResolvedValue(
      toBoard({ group: { id: true, name: 'Family Premium', monthly_price: 299, currency: 'UAH' }, members: [member('oleh', 0, true)], payments: [] }, '2026-10-17'),
    )
    renderWithProviders(<BoardPage />)
    expect(await screen.findByText('Ще ніхто не платить · 299 UAH на місяць')).toBeInTheDocument()
  })

  test('shows a loading message, then an error message when the Board cannot load', async () => {
    vi.mocked(fetchBoard).mockRejectedValue(new Error('offline'))
    renderWithProviders(<BoardPage />)
    expect(screen.getByText('Завантаження…')).toBeInTheDocument()
    expect(await screen.findByText('Не вдалося завантажити дані. Спробуйте ще раз.')).toBeInTheDocument()
  })

  test('shows the empty state before a Group exists', async () => {
    vi.mocked(fetchBoard).mockResolvedValue(toBoard({ group: null, members: [], payments: [] }, '2026-10-17'))
    renderWithProviders(<BoardPage />)
    expect(await screen.findByText('Тут поки нікого немає.')).toBeInTheDocument()
  })
})
