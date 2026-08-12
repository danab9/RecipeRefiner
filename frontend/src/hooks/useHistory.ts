import { useQuery } from '@tanstack/react-query'
import { getHistory } from '@/api/recipes'
import { queryKeys } from '@/hooks/queryKeys'
import type { Recipe } from '@/types/recipe'

/**
 * The logged-in user's saved recipes. `enabled` gates the fetch on being logged
 * in (mirrors the Vue `watch(userId)` → fetch history), so it never fires a 403
 * while logged out.
 */
export function useHistory(enabled: boolean) {
  return useQuery<Recipe[]>({
    queryKey: queryKeys.history,
    queryFn: getHistory,
    enabled,
  })
}
