// Supabase clients for the database tests. Values come from .env.local (see .env.example).
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../src/data/database.types.ts'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
if (!url || !key) throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local')

const options = { auth: { persistSession: false, autoRefreshToken: false } }

/** A visitor who is not signed in. */
export const anon = createClient<Database>(url, key, options)

/** A client signed in as the Admin (SUPABASE_ADMIN_EMAIL / SUPABASE_ADMIN_PASSWORD in .env.local). */
export async function signedInAdmin() {
  const email = process.env.SUPABASE_ADMIN_EMAIL
  const password = process.env.SUPABASE_ADMIN_PASSWORD
  if (!email || !password) throw new Error('Set SUPABASE_ADMIN_EMAIL and SUPABASE_ADMIN_PASSWORD in .env.local')
  const client = createClient<Database>(url!, key!, options)
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw error
  return client
}
