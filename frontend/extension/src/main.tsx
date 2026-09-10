import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import '@/index.css' // app Tailwind tokens + globals
import './popup.css' // popup-only sizing overrides (must come after index.css)
import RecipePopup from './RecipePopup'

const container = document.getElementById('root')
if (!container) {
  throw new Error('Root container #root not found in popup HTML')
}

// RecipeCard calls useDeleteRecipe() unconditionally (rules of hooks), so a
// QueryClient must be in context even though its delete UI never shows here.
createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RecipePopup />
    </QueryClientProvider>
  </StrictMode>,
)
