import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      exclude: [...configDefaults.exclude, 'supabase/**', '**/*.db.test.ts'], // database tests run via `npm run test:db`
    },
  }),
)
