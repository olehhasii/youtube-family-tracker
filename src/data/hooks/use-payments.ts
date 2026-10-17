import { deletablePayment } from '../../model/payments'
import type { BoardRow } from '../board'
import { hidePayment, showPayment } from '../pending-removals'
import { deleteLatestPayment, recordPayment } from '../queries'
import { useBoardMutation } from './use-board-mutation'

export const useRecordPayment = () =>
  useBoardMutation(({ memberId, months }: { memberId: string; months: number }) => recordPayment(memberId, months))

export const useDeleteLatestPayment = () =>
  useBoardMutation(({ memberId, paymentId }: { memberId: string; paymentId?: string }) => deleteLatestPayment(memberId, paymentId))

/**
 * Hides the Member's latest Payment at once and deletes it only on `commit`, so `undo` brings it back
 * untouched (received date included). Null when there is nothing to remove.
 */
export function useRemoveLatestPayment() {
  const { mutateAsync } = useDeleteLatestPayment()
  return ({ member, payments }: BoardRow) => {
    const latest = deletablePayment(member, payments)
    if (!latest) return null
    hidePayment(latest.id)
    return {
      payment: latest,
      undo: () => showPayment(latest.id),
      // only this Payment, even if another became the latest meanwhile; gone from the refetched rows by `finally`
      commit: () => mutateAsync({ memberId: member.id, paymentId: latest.id }).finally(() => showPayment(latest.id)),
    }
  }
}
