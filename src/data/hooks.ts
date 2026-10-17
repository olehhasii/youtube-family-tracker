// The only way UI code reads or changes data. Every change refreshes the Board.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { deletablePayment } from '../model'
import { type BoardRow, type BoardTables, toBoard } from './board'
import { hidePayment, showPayment, useHiddenPayments } from './pending-removals'
import {
  addMember,
  deleteLatestPayment,
  deleteMember,
  fetchBoardTables,
  isSignedIn,
  onSignedInChange,
  signIn,
  signOut,
  recordPayment,
  updateGroup,
  updateMember,
} from './queries'
import { kyivToday } from './today'

const boardKey = ['board'] as const

/** Today's Kyiv date, updating when the day changes while the app stays open. */
export function useKyivToday() {
  const [today, setToday] = useState(kyivToday)
  useEffect(() => {
    const timer = setInterval(() => setToday(kyivToday()), 60_000) // same value → React skips the re-render
    return () => clearInterval(timer)
  }, [])
  return today
}

export function useBoard() {
  const today = useKyivToday()
  const hidden = useHiddenPayments()
  // the cache holds the stored rows; the Board is worked out from them for today, without removals in waiting
  const select = useCallback(
    (tables: BoardTables) => toBoard({ ...tables, payments: tables.payments.filter((p) => !hidden.has(p.id)) }, today),
    [today, hidden],
  )
  return useQuery({ queryKey: boardKey, queryFn: fetchBoardTables, select })
}

const signedInKey = ['signed-in'] as const

/** Whether the Admin is signed in on this device. False until known. */
export function useAdmin() {
  const queryClient = useQueryClient()
  useEffect(() => onSignedInChange((signedIn) => queryClient.setQueryData(signedInKey, signedIn)), [queryClient])
  return useQuery({ queryKey: signedInKey, queryFn: isSignedIn, staleTime: Infinity }).data ?? false
}

/** Signs the Admin in; resolves false for a wrong email or password. */
export function useSignIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) => signIn(credentials),
    onSuccess: (signedIn) => queryClient.setQueryData(signedInKey, signedIn),
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: () => signOut(), onSuccess: () => queryClient.setQueryData(signedInKey, false) })
}

function useBoardMutation<Vars>(write: (vars: Vars) => Promise<void>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: Vars) => write(vars), // TanStack passes a context too; the writes take only their own input
    onSettled: () => queryClient.invalidateQueries({ queryKey: boardKey }),
  })
}

export const useRecordPayment = () =>
  useBoardMutation(({ memberId, months }: { memberId: string; months: number }) => recordPayment(memberId, months))
export const useDeleteLatestPayment = () =>
  useBoardMutation(({ memberId, paymentId }: { memberId: string; paymentId?: string }) => deleteLatestPayment(memberId, paymentId))

/**
 * Removes a Member's latest Payment from the Board at once, and from the database only on `commit`,
 * so `undo` can bring it back untouched (received date included). Null when there is nothing to remove.
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
export const useUpdateGroup = () => useBoardMutation(updateGroup)
export const useAddMember = () => useBoardMutation(addMember)
export const useUpdateMember = () =>
  useBoardMutation(({ id, changes }: { id: string; changes: Parameters<typeof updateMember>[1] }) => updateMember(id, changes))
export const useDeleteMember = () => useBoardMutation(deleteMember)
