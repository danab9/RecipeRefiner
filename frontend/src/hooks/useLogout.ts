import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logout } from '@/api/auth'
import { queryKeys } from '@/hooks/queryKeys'

/** End the session, then clear the user and history from the cache. */
export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, void>({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.me, null)
      queryClient.removeQueries({ queryKey: queryKeys.history })
    },
  })
}
