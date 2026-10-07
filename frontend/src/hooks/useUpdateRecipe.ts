import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRecipe } from "@/api/recipes";
import { queryKeys } from "@/hooks/queryKeys";
import type { Recipe } from "@/types/recipe";

/** Save edits to a recipe, then refresh history from the server. */
export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  return useMutation<Recipe, Error, Recipe>({
    mutationFn: updateRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.history });
    },
  });
}
