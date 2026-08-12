import { useMutation, useQueryClient } from '@tanstack/react-query'
import { scrapeRecipe } from '@/api/recipes'
import { queryKeys } from '@/hooks/queryKeys'
import type { Recipe } from '@/types/recipe'

/**
 * Scrape a recipe from a URL. When the user is logged in the backend also saves
 * it to history, so a success invalidates `['history']`.
 */
export function useScrapeRecipe() {
  const queryClient = useQueryClient()
  return useMutation<Recipe, Error, string>({
    mutationFn: scrapeRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.history })
    },
  })
}
