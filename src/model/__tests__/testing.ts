// Test helpers for src/model. Not part of the public surface.
import type { Member, Payment } from '../types'

export const sasha: Member = { id: 'sasha', name: 'Sasha', exempt: false }
export const dima: Member = { id: 'dima', name: 'Dima', exempt: false }
export const oleh: Member = { id: 'oleh', name: 'Oleh', exempt: true }

let n = 0
/** A Payment of `months` months starting at `firstMonth`, received on that month's 1st. */
export function pay(firstMonth: string, months: number, member: Member = sasha): Payment {
  return { id: `p${++n}`, memberId: member.id, firstMonth, months, receivedOn: `${firstMonth}-01` }
}
