// Reads and writes against Supabase. Payments only change through the database functions (ADR 0001).
import type { Day } from '../model'
import { type Board, type BoardTables, toBoard } from './board'
import type { Database } from './database.types'
import { supabase } from './supabase'
import { kyivToday } from './today'

type Tables = Database['public']['Tables']

export async function fetchBoard(today: Day = kyivToday()): Promise<Board> {
  return toBoard(await fetchBoardTables(), today)
}

/** The rows the Board is built from, as stored. */
export async function fetchBoardTables(): Promise<BoardTables> {
  const [group, members, payments] = await Promise.all([
    supabase.from('groups').select('*').maybeSingle(), // none until the Admin creates it
    supabase.from('members').select('*'),
    supabase.from('payments').select('*'),
  ])
  if (group.error) throw group.error
  if (members.error) throw members.error
  if (payments.error) throw payments.error
  return { group: group.data, members: members.data, payments: payments.data }
}

export async function recordPayment(memberId: string, months: number) {
  const { error } = await supabase.rpc('record_payment', { p_member_id: memberId, p_months: months })
  if (error) throw error
}

/** Deletes the Member's latest Payment; with `paymentId`, only if that is still the latest (else throws). */
export async function deleteLatestPayment(memberId: string, paymentId?: string) {
  const { error } = await supabase.rpc('delete_latest_payment', { p_member_id: memberId, p_payment_id: paymentId })
  if (error) throw error
}

// The Admin is the only account (sign-ups are off), so being signed in means being the Admin.
export async function isSignedIn() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session !== null
}

/** Calls `listener` whenever someone signs in or out; returns the unsubscribe. */
export function onSignedInChange(listener: (signedIn: boolean) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => listener(session !== null))
  return () => data.subscription.unsubscribe()
}

/** False for a wrong email or password; throws when signing in failed for another reason. */
export async function signIn({ email, password }: { email: string; password: string }) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error?.code === 'invalid_credentials') return false
  if (error) throw error
  return true
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Row level security makes a write the Admin isn't allowed to do affect 0 rows instead of failing; surface that.
function changedSomething({ data, error }: { data: unknown[] | null; error: Error | null }) {
  if (error) throw error
  if (!data?.length) throw new Error('Nothing was changed. Is the Admin signed in?')
}

export async function updateGroup(changes: Tables['groups']['Update']) {
  // the Group is a single row whose id is always `true`
  changedSomething(await supabase.from('groups').update(changes).eq('id', true).select('id'))
}

export async function addMember(member: Tables['members']['Insert']) {
  const { error } = await supabase.from('members').insert(member)
  if (error) throw error
}

export async function updateMember(id: string, changes: Tables['members']['Update']) {
  changedSomething(await supabase.from('members').update(changes).eq('id', id).select('id'))
}

export async function deleteMember(id: string) {
  changedSomething(await supabase.from('members').delete().eq('id', id).select('id'))
}
