import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { getMe } from "@/api/auth";
import { queryKeys } from "@/hooks/queryKeys";
import type { User } from "@/types/recipe";

/**
 * The auth spine. Resolves to the current `User`, or `null` when logged out
 * (the backend answers `GET /me/` with 401). This is the React equivalent of the
 * old Vue `authResolved` flag: use `isPending` to tell "not known yet" apart from
 * "not logged in" so auth-dependent UI doesn't flash on load.
 *
 * Pass `enabled: false` to keep the query dormant (no `/api/me/` request) where
 * the result can't matter — e.g. a fresh scrape that has no editable state. An
 * omitted `enabled` keeps the default (always on).
 */
export function useMe(options?: { enabled?: boolean }) {
  return useQuery<User | null>({
    queryKey: queryKeys.me,
    queryFn: async () => {
      try {
        return await getMe();
      } catch (error) {
        // A 401 is the normal logged-out signal, not an error to surface.
        if (isAxiosError(error) && error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    enabled: options?.enabled,
  });
}
