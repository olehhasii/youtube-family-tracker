// Payments only change through the database functions (ADR 0001), never by writing the table.
import type { Day } from '../model/types'
import { type Board, type BoardTables, toBoard } from './board'
import type { Database } from './database.types'
import { supabase } from './supabase'
import { kyivToday } from './today'

type Tables = Database['public']['Tables']

export async function fetchBoard(today: Day = kyivToday()): Promise<Board> {
  return toBoard(await fetchBoardTables(), today)
}

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

/** Creates the Group on its first save. */
export async function saveGroup(group: Omit<Tables['groups']['Insert'], 'id'>) {
  // the Group is a single row whose id is always `true`
  changedSomething(await supabase.from('groups').upsert({ ...group, id: true }).select('id'))
}

/** Returns the new Member's id. */
export async function addMember(member: Tables['members']['Insert']): Promise<string> {
  const { data, error } = await supabase.from('members').insert(member).select('id').single()
  if (error) throw error
  return data.id
}

export async function updateMember(id: string, changes: Tables['members']['Update']) {
  changedSomething(await supabase.from('members').update(changes).eq('id', id).select('id'))
}

export async function deleteMember(id: string) {
  changedSomething(await supabase.from('members').delete().eq('id', id).select('id'))
}

/** Uploads a new file (never overwrites, so the old photo stays valid until the Member points elsewhere); returns its path. */
export async function uploadAvatar(memberId: string, image: Blob): Promise<string> {
  const path = `${memberId}/${Date.now()}.${image.type.split('/')[1] ?? 'webp'}`
  const { error } = await supabase.storage.from('avatars').upload(path, image, { contentType: image.type })
  if (error) throw error
  return path
}

export async function removeAvatar(path: string) {
  const { error } = await supabase.storage.from('avatars').remove([path])
  if (error) throw error
}
