// Database rows → what the Board shows. Pure, so it is tested without a network.
import { type Day, type GroupSummary, type Member, type Payment, type Standing, boardOrder, groupSummary, standing } from '../model'
import type { Database } from './database.types'

type Tables = Database['public']['Tables']

/** The database rows the Board is built from. */
export type BoardTables = {
  /** null until the Admin has created the Group. */
  group: Tables['groups']['Row'] | null
  members: Tables['members']['Row'][]
  payments: Tables['payments']['Row'][]
}

export type BoardMember = Member & { slug: string; avatarPath: string | null }

export type BoardRow = {
  member: BoardMember
  standing: Standing
  /** This Member's Payments, newest first. */
  payments: Payment[]
}

export type Board = {
  /** The Kyiv date every Standing was worked out for. */
  today: Day
  group: { name: string; monthlyPrice: number; currency: string } | null
  rows: BoardRow[]
  summary: GroupSummary
}

const toPayment = (p: Tables['payments']['Row']): Payment => ({
  id: p.id,
  memberId: p.member_id,
  firstMonth: p.first_month.slice(0, 7), // stored as the 1st of the month
  months: p.months,
  receivedOn: p.received_on,
})

const toMember = (m: Tables['members']['Row']): BoardMember => ({
  id: m.id,
  name: m.name,
  exempt: m.exempt,
  slug: m.slug,
  avatarPath: m.avatar_path,
})

export function toBoard({ group, members, payments }: BoardTables, today: Day): Board {
  const allPayments = payments.map(toPayment)
  // position first, then name, so equal positions never swap places between fetches
  const ordered = members.toSorted((a, b) => a.position - b.position || a.name.localeCompare(b.name))

  const rows = ordered.map((m): BoardRow => {
    const member = toMember(m)
    return {
      member,
      standing: standing(member, allPayments, today),
      payments: allPayments.filter((p) => p.memberId === m.id).toSorted((a, b) => b.firstMonth.localeCompare(a.firstMonth)),
    }
  })
  const sorted = boardOrder(rows.map((row) => ({ status: row.standing.status, row }))).map(({ row }) => row)

  return {
    today,
    group: group && { name: group.name, monthlyPrice: group.monthly_price, currency: group.currency },
    rows: sorted,
    summary: groupSummary(
      sorted.map((r) => r.standing.status),
      group?.monthly_price ?? 0,
    ),
  }
}
