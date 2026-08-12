import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RecipeCard from '@/components/RecipeCard'
import { renderWithProviders } from '@/test/renderWithProviders'
import type { Recipe } from '@/types/recipe'

const { deleteRecipe } = vi.hoisted(() => ({ deleteRecipe: vi.fn() }))

vi.mock('@/api/recipes', () => ({
  scrapeRecipe: vi.fn(),
  getHistory: vi.fn(),
  deleteRecipe,
}))

const recipe: Recipe = {
  id: 1,
  title: 'Test Recipe',
  ingredients: ['1 egg'],
  instructions: 'Cook it well.',
}

describe('RecipeCard', () => {
  it('starts collapsed in the history variant and expands on toggle', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RecipeCard recipe={recipe} variant="history" />)

    expect(screen.queryByText('Ingredients')).not.toBeInTheDocument()
    expect(screen.queryByText('Instructions')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Expand recipe' }))

    expect(screen.getByText('Ingredients')).toBeInTheDocument()
    expect(screen.getByText('Instructions')).toBeInTheDocument()
    expect(screen.getByText('1 egg')).toBeInTheDocument()
  })

  it('opens the delete confirmation modal when Delete is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RecipeCard recipe={recipe} variant="history" />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(screen.getByRole('dialog', { name: 'Delete recipe?' })).toBeInTheDocument()
  })
})
