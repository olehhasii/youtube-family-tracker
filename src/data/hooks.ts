// The only way UI code reads or changes data. Every change refreshes the Board.
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  addMember,
  deleteLatestPayment,
  deleteMember,
  fetchBoard,
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
  return useQuery({
    queryKey: [...boardKey, today],
    queryFn: () => fetchBoard(today),
    placeholderData: keepPreviousData, // keep showing yesterday's Board while today's loads
  })
}

function useBoardMutation<Vars>(write: (vars: Vars) => Promise<void>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: write,
    onSettled: () => queryClient.invalidateQueries({ queryKey: boardKey }),
  })
}

export const useRecordPayment = () =>
  useBoardMutation(({ memberId, months }: { memberId: string; months: number }) => recordPayment(memberId, months))
export const useDeleteLatestPayment = () => useBoardMutation(deleteLatestPayment)
export const useUpdateGroup = () => useBoardMutation(updateGroup)
export const useAddMember = () => useBoardMutation(addMember)
export const useUpdateMember = () =>
  useBoardMutation(({ id, changes }: { id: string; changes: Parameters<typeof updateMember>[1] }) => updateMember(id, changes))
export const useDeleteMember = () => useBoardMutation(deleteMember)
