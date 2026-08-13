import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RecipeCardEditor from '@/components/RecipeCardEditor'
import type { Recipe } from '@/types/recipe'

const recipe: Recipe = {
  id: 1,
  title: 'Test Recipe',
  ingredients: ['1 egg', '2 cups flour'],
  instructions: 'Cook it well.',
}

function renderEditor(overrides: Partial<Parameters<typeof RecipeCardEditor>[0]> = {}) {
  const onUpdate = vi.fn()
  const onCancel = vi.fn()
  const onCollapse = vi.fn()
  render(
    <RecipeCardEditor
      recipe={recipe}
      variant="history"
      onUpdate={onUpdate}
      onCancel={onCancel}
      onCollapse={onCollapse}
      {...overrides}
    />,
  )
  return { onUpdate, onCancel, onCollapse }
}

describe('RecipeCardEditor', () => {
  it('seeds the title, ingredient, and instructions fields from the recipe', () => {
    renderEditor()

    expect(screen.getByLabelText('Recipe title')).toHaveValue('Test Recipe')
    expect(screen.getByLabelText('Ingredient 1')).toHaveValue('1 egg')
    expect(screen.getByLabelText('Ingredient 2')).toHaveValue('2 cups flour')
    expect(screen.getByLabelText('Instructions')).toHaveValue('Cook it well.')
  })

  it('adds an ingredient row when Add ingredient is clicked', async () => {
    const user = userEvent.setup()
    renderEditor()

    expect(screen.getAllByLabelText(/^Ingredient \d+$/)).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Add ingredient' }))

    expect(screen.getAllByLabelText(/^Ingredient \d+$/)).toHaveLength(3)
  })

  it('removes an ingredient row when Remove ingredient is clicked', async () => {
    const user = userEvent.setup()
    renderEditor()

    const removeButtons = screen.getAllByRole('button', {
      name: 'Remove ingredient',
    })
    await user.click(removeButtons[0])

    const remaining = screen.getAllByLabelText(/^Ingredient \d+$/)
    expect(remaining).toHaveLength(1)
    expect(remaining[0]).toHaveValue('2 cups flour')
  })

  it('calls onUpdate with the edited values', async () => {
    const user = userEvent.setup()
    const { onUpdate } = renderEditor()

    const title = screen.getByLabelText('Recipe title')
    await user.clear(title)
    await user.type(title, 'New Title')

    await user.click(screen.getByRole('button', { name: 'Update' }))

    expect(onUpdate).toHaveBeenCalledWith({
      title: 'New Title',
      ingredients: ['1 egg', '2 cups flour'],
      instructions: 'Cook it well.',
    })
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const { onCancel } = renderEditor()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
