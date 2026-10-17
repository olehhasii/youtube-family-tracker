import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

// Integration tests against the linked Supabase project. Run with `npm run test:db`; they need .env.local.
export default defineConfig(({ mode }) => ({
  test: {
    include: ['supabase/__tests__/**/*.test.ts'],
    env: loadEnv(mode, process.cwd(), ''),
    testTimeout: 20_000,
    fileParallelism: false,
  },
}))
