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

// The popup is a separate origin and can't read the web app's stored theme,
// so follow the OS preference (matches the web app's no-stored-theme fallback).
// A one-shot pre-paint toggle is enough: the popup is short-lived and has no
// theme toggle, so the `.dark` token overrides in index.css just need to apply.
document.documentElement.classList.toggle(
  'dark',
  window.matchMedia('(prefers-color-scheme: dark)').matches,
)

// RecipeCard calls useDeleteRecipe() unconditionally (rules of hooks), so a
// QueryClient must be in context even though its delete UI never shows here.
createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RecipePopup />
    </QueryClientProvider>
  </StrictMode>,
)
