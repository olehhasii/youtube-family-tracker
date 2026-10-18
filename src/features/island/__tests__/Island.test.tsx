import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { type Board, toBoard } from '../../../data/board'
import { isSignedIn, signIn, signOut } from '../../../data/queries'
import i18n from '../../../i18n/index'
import { TOAST_MS } from '../../../shared/lib/motion'
import { Island } from '../Island'
import { useToast } from '../../../shared/toast/use-toast'
import { ToastProvider } from '../../../shared/toast/ToastProvider'

// Stand in for the network only.
vi.mock('../../../data/queries', () => ({
  isSignedIn: vi.fn(),
  onSignedInChange: vi.fn(() => () => {}),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

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

let queryClient: QueryClient
const ui = (data: Board | undefined, toast: string | null = null) => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <RaiseToast text={toast} />
      <Island board={data} />
    </ToastProvider>
  </QueryClientProvider>
)
const renderIsland = (data: Board | undefined) => render(ui(data))

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  vi.mocked(isSignedIn).mockResolvedValue(false)
  return i18n.changeLanguage('uk')
})
afterEach(() => vi.useRealTimers())

describe('Island', () => {
  test('at rest, shows the time and date in Kyiv, ticking each minute', () => {
    vi.useFakeTimers()
    vi.setSystemTime('2026-10-17T09:05:30Z')
    renderIsland(board)
    expect(screen.getByText('12:05')).toBeInTheDocument()
    expect(screen.getByText('субота, 17 жовтня')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(30_000))
    expect(screen.getByText('12:06')).toBeInTheDocument()
  })

  test('UA/EN switches the language, the page title and <html lang>, and remembers the choice', async () => {
    const user = userEvent.setup()
    renderIsland(board)
    expect(document.title).toBe('YouTube Family · хто заплатив')

    await user.click(screen.getByRole('button', { name: /^UA/ }))
    expect(screen.getByRole('button', { name: /^EN/ })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
    expect(document.title).toBe("YouTube Family · who's paid")
    expect(localStorage.getItem('language')).toBe('en')
  })

  test('the theme button switches between dark (the default) and light, and remembers the choice', async () => {
    const user = userEvent.setup()
    renderIsland(board)
    const root = document.documentElement
    expect(root.dataset.theme).toBeUndefined()

    await user.click(screen.getByRole('button', { name: 'Увімкнути світлу тему' }))
    expect(root.dataset.theme).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')

    await user.click(screen.getByRole('button', { name: 'Увімкнути темну тему' }))
    expect(root.dataset.theme).toBeUndefined()
    expect(localStorage.getItem('theme')).toBe('dark')
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
    expect(screen.getByText(/сімейну підписку YouTube Premium/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/olehhasii/youtube-family-tracker')

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
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime('2026-10-17T09:05:30Z')
    const user = userEvent.setup()
    renderIsland(board)

    await user.click(screen.getByRole('button', { name: 'UA · змінити мову на англійську' }))
    expect(screen.getByText('Saturday 17 October')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'EN · switch language to Ukrainian' }))
    expect(screen.getByText('субота, 17 жовтня')).toBeInTheDocument()
  })

  test('while the Board loads, the menu still works', async () => {
    const user = userEvent.setup()
    renderIsland(undefined)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Меню' }))
    expect(screen.getByRole('link', { name: /GitHub/ })).toBeInTheDocument()
  })

  describe('Admin sign-in', () => {
    test('the island grows into a sign-in form; signing in says so and goes back to rest', async () => {
      vi.mocked(signIn).mockResolvedValue(true)
      const user = userEvent.setup()
      renderIsland(board)

      await user.click(screen.getByRole('button', { name: 'Меню' }))
      await user.click(screen.getByRole('button', { name: 'Увійти як адміністратор' }))
      expect(screen.getByLabelText('Пошта')).toHaveFocus()
      await user.type(screen.getByLabelText('Пошта'), 'admin@example.com')
      await user.type(screen.getByLabelText('Пароль'), 'secret{Enter}')

      expect(signIn).toHaveBeenCalledWith({ email: 'admin@example.com', password: 'secret' })
      await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Ви увійшли як адміністратор'))
      expect(screen.queryByLabelText('Пошта')).not.toBeInTheDocument()
    })

    test('a wrong password keeps the form open with a message', async () => {
      vi.mocked(signIn).mockResolvedValue(false)
      const user = userEvent.setup()
      renderIsland(board)

      await user.click(screen.getByRole('button', { name: 'Меню' }))
      await user.click(screen.getByRole('button', { name: 'Увійти як адміністратор' }))
      await user.type(screen.getByLabelText('Пошта'), 'admin@example.com')
      await user.type(screen.getByLabelText('Пароль'), 'wrong{Enter}')

      expect(await screen.findByRole('alert')).toHaveTextContent('Неправильна пошта або пароль')
      expect(screen.getByLabelText('Пароль')).toHaveValue('')
    })

    test('the signed-in Admin can sign out from the menu', async () => {
      vi.mocked(isSignedIn).mockResolvedValue(true)
      vi.mocked(signOut).mockResolvedValue()
      const user = userEvent.setup()
      renderIsland(board)

      await user.click(screen.getByRole('button', { name: 'Меню' }))
      await user.click(await screen.findByRole('button', { name: 'Вийти' }))
      expect(signOut).toHaveBeenCalled()
      await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Ви вийшли'))
    })
  })
})
