import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteRecipe } from '@/api/recipes'
import { queryKeys } from '@/hooks/queryKeys'

/** Delete a saved recipe, then refresh history from the server. */
export function useDeleteRecipe() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, number>({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.history })
    },
  })
}
