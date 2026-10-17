import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from '../App'
import '../i18n'

test('renders the empty Board in Ukrainian by default', async () => {
  render(<App />)
  expect(await screen.findByText('Тут поки нікого немає.')).toBeInTheDocument()
})
