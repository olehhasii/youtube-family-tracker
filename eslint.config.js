import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Only the data layer talks to Supabase (CLAUDE.md "Code layout")
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/data/**', '**/__tests__/**'], // tests may stub data internals at the network boundary
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: ['@supabase/*'], message: 'Use the hooks from src/data instead.' }, { group: ['**/data/queries', '**/data/supabase', '**/data/pending-removals', '**/data/database.types'], message: 'Use the hooks in src/data/hooks instead.' }] }],
    },
  },
])
