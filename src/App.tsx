import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import { RouterProvider, createBrowserRouter } from 'react-router'
import { BoardPage } from './features/board/BoardPage'
import { ToastProvider } from './features/island/ToastProvider'

const queryClient = new QueryClient()

const router = createBrowserRouter([{ path: '/', element: <BoardPage /> }])

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* honour the OS "reduce motion" setting everywhere */}
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </MotionConfig>
    </QueryClientProvider>
  )
}
