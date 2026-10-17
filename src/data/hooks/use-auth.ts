import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { isSignedIn, onSignedInChange, signIn, signOut } from '../queries'

const signedInKey = ['signed-in'] as const

/** False until the session is known, so edit controls never flash for visitors. */
export function useAdmin() {
  const queryClient = useQueryClient()
  useEffect(() => onSignedInChange((signedIn) => queryClient.setQueryData(signedInKey, signedIn)), [queryClient])
  return useQuery({ queryKey: signedInKey, queryFn: isSignedIn, staleTime: Infinity }).data ?? false
}

/** Resolves false for a wrong email or password. */
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
