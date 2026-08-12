import type { ReactElement, ReactNode } from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/** A fresh QueryClient per test, with retries off for deterministic behavior. */
export function makeTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

/**
 * Render a component wrapped in a QueryClientProvider. Components that use
 * TanStack Router hooks (`useNavigate`, `Link`) should mock `@tanstack/react-router`
 * in the test file, since routing context is not provided here.
 */
export function renderWithProviders(
  ui: ReactElement,
  { client = makeTestQueryClient() }: { client?: QueryClient } = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return { client, ...render(ui, { wrapper: Wrapper }) }
}
