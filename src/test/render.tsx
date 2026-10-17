// Renders UI with the app's providers and a fresh query cache per test.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { ToastProvider } from '../features/island/ToastProvider'

export function renderWithProviders(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>{ui}</ToastProvider>
    </QueryClientProvider>,
  )
}
