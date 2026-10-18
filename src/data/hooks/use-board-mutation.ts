import { useMutation, useQueryClient } from '@tanstack/react-query'

export const boardKey = ['board'] as const

export function useBoardMutation<Vars, Result = void>(write: (vars: Vars) => Promise<Result>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: Vars) => write(vars), // TanStack passes a context too; the writes take only their own input
    onSettled: () => queryClient.invalidateQueries({ queryKey: boardKey }),
  })
}
