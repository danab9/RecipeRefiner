import { useMutation, useQueryClient } from '@tanstack/react-query'
import { login } from '@/api/auth'
import { queryKeys } from '@/hooks/queryKeys'
import type { LoginPayload } from '@/types/auth'
import type { User } from '@/types/recipe'

/** Log in, then seed `['me']` and refetch history for the new session. */
export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation<User, Error, LoginPayload>({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.me, user)
      queryClient.invalidateQueries({ queryKey: queryKeys.history })
    },
  })
}
