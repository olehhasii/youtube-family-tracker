import { expect, test } from 'vitest'
import { fetchBoard } from '../queries'
import { supabase } from '../supabase'

test('fetchBoard loads the real Group and every Member, each with their own Payments', async () => {
  const board = await fetchBoard('2026-10-17')

  // compare against plain counts straight from the tables, not against the mapping itself
  const [group, members, payments] = await Promise.all([
    supabase.from('groups').select('name').single(),
    supabase.from('members').select('id', { count: 'exact', head: true }),
    supabase.from('payments').select('id', { count: 'exact', head: true }),
  ])
  expect(board.group?.name).toBe(group.data?.name)
  expect(board.rows).toHaveLength(members.count!)
  expect(board.rows.flatMap((r) => r.payments)).toHaveLength(payments.count!)
  expect(board.rows.every((r) => r.payments.every((p) => p.memberId === r.member.id))).toBe(true)
})
