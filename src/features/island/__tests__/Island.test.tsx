import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { type Board, toBoard } from '../../../data/board'
import i18n from '../../../i18n'
import { TOAST_MS } from '../../../ui/motion'
import { Island } from '../Island'
import { useToast } from '../toast'
import { ToastProvider } from '../ToastProvider'

const member = (slug: string, position: number) => ({
  id: `id-${slug}`,
  name: slug[0].toUpperCase() + slug.slice(1),
  slug,
  exempt: false,
  position,
  avatar_path: null,
  created_at: '',
})

const board: Board = toBoard(
  {
    group: { id: true, name: 'Family Premium', monthly_price: 299, currency: 'UAH' },
    members: [member('sasha', 1), member('ira', 2)],
    payments: [{ id: 'p1', member_id: 'id-sasha', first_month: '2026-05-01', months: 3, received_on: '2026-05-03', created_at: '' }],
  },
  '2026-10-17',
)

/** Raises a toast whenever `text` changes, the way an action elsewhere on the Board would. */
function RaiseToast({ text }: { text: string | null }) {
  const show = useToast()
  useEffect(() => {
    if (text) show(text)
  }, [text, show])
  return null
}

const ui = (data: Board | undefined, toast: string | null = null) => (
  <ToastProvider>
    <RaiseToast text={toast} />
    <Island board={data} />
  </ToastProvider>
)
const renderIsland = (data: Board | undefined) => render(ui(data))

beforeEach(() => i18n.changeLanguage('uk'))
afterEach(() => vi.useRealTimers())

describe('Island', () => {
  test('at rest, says who is behind', () => {
    renderIsland(board)
    expect(screen.getByText('Заборгованість')).toBeInTheDocument()
    expect(screen.getByText('Sasha · 3 місяці')).toBeInTheDocument()
  })

  test('••• opens the menu and Back returns, keeping focus in the island', async () => {
    const user = userEvent.setup()
    renderIsland(board)

    await user.click(screen.getByRole('button', { name: 'Меню' }))
    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/olehhasii/youtube-family-tracker')
    expect(screen.getByRole('button', { name: 'Назад' })).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Назад' }))
    expect(screen.getByRole('button', { name: 'Меню' })).toHaveFocus()
    expect(screen.queryByRole('link', { name: /GitHub/ })).not.toBeInTheDocument()
  })

  test('Escape steps back: about → menu → rest', async () => {
    const user = userEvent.setup()
    renderIsland(board)

    await user.click(screen.getByRole('button', { name: 'Меню' }))
    await user.click(screen.getByRole('button', { name: 'Про застосунок' }))
    expect(screen.getByText(/YouTube Premium Family/)).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: 'Про застосунок' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: 'Меню' })).toHaveFocus()
  })

  test('a toast covers the menu, is announced, and leaves after its time', async () => {
    const user = userEvent.setup()
    const { rerender } = renderIsland(board)
    await user.click(screen.getByRole('button', { name: 'Меню' }))
    vi.useFakeTimers()

    rerender(ui(board, 'Sasha · жовтень внесено'))
    expect(screen.getByRole('status')).toHaveTextContent('Sasha · жовтень внесено')
    expect(screen.getByText('Sasha · жовтень внесено', { selector: '.truncate' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Стан і меню' })).toHaveFocus()

    act(() => vi.advanceTimersByTime(TOAST_MS - 1))
    expect(screen.getByRole('status')).toHaveTextContent('Sasha · жовтень внесено')
    act(() => vi.advanceTimersByTime(1))
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(screen.getByRole('button', { name: 'Назад' })).toHaveFocus()
  })

  test('the language button switches between UA and EN', async () => {
    const user = userEvent.setup()
    renderIsland(board)

    await user.click(screen.getByRole('button', { name: 'UA · змінити мову на англійську' }))
    expect(screen.getByText('Sasha · 3 months')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'EN · switch language to Ukrainian' }))
    expect(screen.getByText('Sasha · 3 місяці')).toBeInTheDocument()
  })

  test('while the Board loads, the menu still works', async () => {
    const user = userEvent.setup()
    renderIsland(undefined)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Меню' }))
    expect(screen.getByRole('link', { name: /GitHub/ })).toBeInTheDocument()
  })
})
