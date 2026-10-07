import { useMutation, useQueryClient } from "@tanstack/react-query";
import { register } from "@/api/auth";
import { queryKeys } from "@/hooks/queryKeys";
import type { RegisterPayload } from "@/types/auth";
import type { User } from "@/types/recipe";

/** Register (auto-logs in), then seed `['me']` and refetch history. */
export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation<User, Error, RegisterPayload>({
    mutationFn: register,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.me, user);
      queryClient.invalidateQueries({ queryKey: queryKeys.history });
    },
  });
}
