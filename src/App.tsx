import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import { RouterProvider, createBrowserRouter } from 'react-router'
import { BoardPage } from './features/board/BoardPage'

const queryClient = new QueryClient()

const router = createBrowserRouter([{ path: '/', element: <BoardPage /> }])

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* honour the OS "reduce motion" setting everywhere */}
      <MotionConfig reducedMotion="user">
        <RouterProvider router={router} />
      </MotionConfig>
    </QueryClientProvider>
  )
}
