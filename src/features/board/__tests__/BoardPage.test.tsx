import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import type { BoardTables } from '../../../data/board'
import { deleteLatestPayment, fetchBoardTables, isSignedIn, recordPayment } from '../../../data/queries'
import '../../../i18n/index'
import { renderWithProviders } from '../../../test/render'
import { TOAST_MS } from '../../../shared/lib/motion'
import { BoardPage } from '../BoardPage'

// Stand in for the network only; mapping, rules and rendering are real.
vi.mock('../../../data/queries', () => ({
  fetchBoardTables: vi.fn(),
  isSignedIn: vi.fn(),
  onSignedInChange: vi.fn(() => () => {}),
  recordPayment: vi.fn(),
  deleteLatestPayment: vi.fn(),
}))

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

const board: BoardTables = {
  group: { id: true, name: 'Family Premium', monthly_price: 299, currency: 'UAH' },
  members: [member('oleh', 0, true), member('sasha', 1), member('ira', 2)],
  payments: [payment('sasha', '2026-02', 3), payment('sasha', '2026-05', 3), payment('ira', '2026-09', 6)],
}

/** The value shown under a stage stat's label. */
const stat = (stage: HTMLElement, label: string) => within(stage).getByText(label).nextElementSibling?.textContent

beforeEach(() => {
  vi.mocked(fetchBoardTables).mockReset()
  vi.mocked(isSignedIn).mockResolvedValue(false)
  vi.useFakeTimers({ toFake: ['Date'] }) // only the clock: the Board is worked out for "today"
  vi.setSystemTime('2026-10-17T09:00:00Z')
})
afterEach(() => vi.useRealTimers())

describe('BoardPage', () => {
  test('lists Members in Board order with their next payment and status', async () => {
    vi.mocked(fetchBoardTables).mockResolvedValue(board)
    renderWithProviders(<BoardPage />)

    const rows = await screen.findAllByRole('listitem')
    expect(rows.map((r) => within(r).getByRole('button', { name: /./ }).textContent)).toEqual([
      expect.stringContaining('Oleh'),
      expect.stringContaining('Sasha'),
      expect.stringContaining('Ira'),
    ])
    expect(rows[1]).toHaveTextContent('Наступний платіж · 1 серпня')
    expect(within(rows[1]).getByText('1 серпня', { selector: 'strong' })).toBeInTheDocument()
    expect(within(rows[1]).getByText('прострочено на 77 днів')).toBeInTheDocument()
    expect(within(rows[1]).getByText('Прострочено 3 місяці')).toBeInTheDocument()
  })

  test('the stage sums up the Group above the list', async () => {
    vi.mocked(fetchBoardTables).mockResolvedValue(board)
    renderWithProviders(<BoardPage />)

    const stage = await screen.findByRole('region', { name: 'Family Premium' })
    expect(within(stage).getByRole('heading', { level: 1 })).toHaveTextContent('Family Premium')
    expect(within(stage).getByText('3 учасники')).toBeInTheDocument()
    expect(stat(stage, 'сплатили')).toBe('1/2')
    expect(within(stage).queryByText('Заборгованість')).not.toBeInTheDocument()
    expect(stat(stage, 'на місяць')).toBe('299 UAH · ≈150 UAH')
  })

  test("tapping a Member opens their details and history; Close goes back", async () => {
    vi.mocked(fetchBoardTables).mockResolvedValue(board)
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
    vi.mocked(fetchBoardTables).mockResolvedValue(board)
    const user = userEvent.setup()
    renderWithProviders(<BoardPage />)

    await user.click(await screen.findByRole('button', { name: /Sasha/ }))
    const detail = await screen.findByRole('region', { name: 'Sasha' })
    expect(within(detail).getByRole('button', { name: 'Закрити' })).toHaveFocus()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.getByRole('button', { name: /Sasha/ })).toHaveFocus())
  })

  test('with nobody paying, the stage says so instead of "0/0"', async () => {
    vi.mocked(fetchBoardTables).mockResolvedValue(
      { group: { id: true, name: 'Family Premium', monthly_price: 299, currency: 'UAH' }, members: [member('oleh', 0, true)], payments: [] },
    )
    renderWithProviders(<BoardPage />)
    const stage = await screen.findByRole('region', { name: 'Family Premium' })
    expect(stat(stage, 'сплатили')).toBe('ще ніхто')
  })

  test('shows a loading message, then an error message when the Board cannot load', async () => {
    vi.mocked(fetchBoardTables).mockRejectedValue(new Error('offline'))
    renderWithProviders(<BoardPage />)
    expect(screen.getByText('Завантаження…')).toBeInTheDocument()
    expect(await screen.findByText('Не вдалося завантажити дані. Спробуйте ще раз.')).toBeInTheDocument()
  })

  test('shows the empty state before a Group exists', async () => {
    vi.mocked(fetchBoardTables).mockResolvedValue({ group: null, members: [], payments: [] })
    renderWithProviders(<BoardPage />)
    expect(await screen.findByText('Тут поки нікого немає.')).toBeInTheDocument()
  })

  describe('as the Admin', () => {
    test('a signed-out visitor sees no edit controls', async () => {
      vi.mocked(fetchBoardTables).mockResolvedValue(board)
      const user = userEvent.setup()
      renderWithProviders(<BoardPage />)

      await screen.findByText('Family Premium')
      expect(screen.queryByRole('button', { name: /Внести платіж/ })).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /Sasha/ }))
      await screen.findByRole('region', { name: 'Sasha' })
      expect(screen.queryByRole('button', { name: /Внести платіж|Видалити/ })).not.toBeInTheDocument()
    })

    test('the signed-in Admin gets a + on every paying Member', async () => {
      vi.mocked(fetchBoardTables).mockResolvedValue(board)
      vi.mocked(isSignedIn).mockResolvedValue(true)
      renderWithProviders(<BoardPage />)

      expect(await screen.findByRole('button', { name: 'Внести платіж: Sasha' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Внести платіж: Ira' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Внести платіж: Oleh' })).not.toBeInTheDocument()
    })

    test('records months through the sheet, continuing from the first unpaid month', async () => {
      vi.mocked(fetchBoardTables).mockResolvedValue(board)
      vi.mocked(isSignedIn).mockResolvedValue(true)
      vi.mocked(recordPayment).mockResolvedValue()
      const user = userEvent.setup()
      renderWithProviders(<BoardPage />)

      await user.click(await screen.findByRole('button', { name: 'Внести платіж: Sasha' }))
      const sheet = await screen.findByRole('dialog', { name: 'Внести платіж · Sasha' })
      expect(within(sheet).getByText('серпень 2026')).toBeInTheDocument()

      await user.click(within(sheet).getByRole('button', { name: 'Більше місяців' }))
      await user.click(within(sheet).getByRole('button', { name: 'Більше місяців' }))
      expect(within(sheet).getByText('серпень – жовтень 2026')).toBeInTheDocument()
      await user.click(within(sheet).getByRole('button', { name: 'Внести 3 місяці' }))

      expect(recordPayment).toHaveBeenCalledWith('id-sasha', 3)
      expect(await screen.findByRole('status')).toHaveTextContent('Sasha · серпень – жовтень 2026 внесено')
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })

    const openSashaAsAdmin = async () => {
      vi.mocked(fetchBoardTables).mockResolvedValue(board)
      vi.mocked(isSignedIn).mockResolvedValue(true)
      const user = userEvent.setup()
      renderWithProviders(<BoardPage />)
      await user.click(await screen.findByRole('button', { name: /^Sasha/ }))
      return { user, detail: await screen.findByRole('region', { name: 'Sasha' }) }
    }
    const history = (detail: HTMLElement) => within(detail).getAllByRole('listitem').map((li) => li.textContent)

    test('the detail card opens the same sheet', async () => {
      const { user, detail } = await openSashaAsAdmin()
      await user.click(within(detail).getByRole('button', { name: 'Внести платіж' }))
      expect(await screen.findByRole('dialog', { name: 'Внести платіж · Sasha' })).toBeInTheDocument()
    })

    test('removing the latest Payment can be undone from the island', async () => {
      const { user, detail } = await openSashaAsAdmin()
      expect(within(detail).getAllByRole('button', { name: /Видалити/ })).toHaveLength(1) // only the latest can go

      await user.click(within(detail).getByRole('button', { name: 'Видалити платіж: травень – липень 2026' }))
      await waitFor(() => expect(history(detail)).toEqual([expect.stringContaining('лютий – квітень 2026')]))
      expect(screen.getByRole('status')).toHaveTextContent('Sasha · травень – липень 2026 видалено')

      await user.click(screen.getByRole('button', { name: 'Скасувати' }))
      await waitFor(() => expect(history(detail)).toHaveLength(2))
      expect(deleteLatestPayment).not.toHaveBeenCalled()
    })

    test('the Payment is deleted for real once the undo toast has gone', async () => {
      vi.mocked(deleteLatestPayment).mockResolvedValue()
      const { user, detail } = await openSashaAsAdmin()
      await user.click(within(detail).getByRole('button', { name: 'Видалити платіж: травень – липень 2026' }))
      await user.unhover(screen.getByRole('button', { name: 'Скасувати' }))
      screen.getByRole('button', { name: 'Скасувати' }).blur() // the timer waits while the island has focus

      expect(deleteLatestPayment).not.toHaveBeenCalled()
      await waitFor(() => expect(deleteLatestPayment).toHaveBeenCalledWith('id-sasha', 'sasha-2026-05'), { timeout: TOAST_MS + 1000 })
    })
  })
})
