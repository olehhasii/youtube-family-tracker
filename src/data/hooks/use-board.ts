import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { type BoardTables, toBoard } from '../board'
import { useHiddenPayments } from '../pending-removals'
import { fetchBoardTables } from '../queries'
import { kyivToday } from '../today'
import { boardKey } from './use-board-mutation'

export function useKyivToday() {
  const [today, setToday] = useState(kyivToday)
  useEffect(() => {
    const timer = setInterval(() => setToday(kyivToday()), 60_000)
    return () => clearInterval(timer)
  }, [])
  return today
}

export function useBoard() {
  const today = useKyivToday()
  const hidden = useHiddenPayments()
  // the cache holds the stored rows, so a new day or a pending removal needs no refetch
  const select = useCallback(
    (tables: BoardTables) => toBoard({ ...tables, payments: tables.payments.filter((p) => !hidden.has(p.id)) }, today),
    [today, hidden],
  )
  return useQuery({ queryKey: boardKey, queryFn: fetchBoardTables, select })
}
