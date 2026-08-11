import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Auth (`['me']`) is derived from a 401; retrying it just delays the
      // logged-out state. Individual queries can opt back into retries.
      retry: false,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})
