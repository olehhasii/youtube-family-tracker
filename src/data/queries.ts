// Reads and writes against Supabase. Payments only change through the database functions (ADR 0001).
import type { Day } from '../model'
import { type Board, toBoard } from './board'
import type { Database } from './database.types'
import { supabase } from './supabase'
import { kyivToday } from './today'

type Tables = Database['public']['Tables']

export async function fetchBoard(today: Day = kyivToday()): Promise<Board> {
  const [group, members, payments] = await Promise.all([
    supabase.from('groups').select('*').maybeSingle(), // none until the Admin creates it
    supabase.from('members').select('*'),
    supabase.from('payments').select('*'),
  ])
  if (group.error) throw group.error
  if (members.error) throw members.error
  if (payments.error) throw payments.error
  return toBoard({ group: group.data, members: members.data, payments: payments.data }, today)
}

export async function recordPayment(memberId: string, months: number) {
  const { error } = await supabase.rpc('record_payment', { p_member_id: memberId, p_months: months })
  if (error) throw error
}

export async function deleteLatestPayment(memberId: string) {
  const { error } = await supabase.rpc('delete_latest_payment', { p_member_id: memberId })
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
