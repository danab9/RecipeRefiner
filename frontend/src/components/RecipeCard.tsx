import { useState } from 'react'
import { ChefHat, ChevronDown, FileText, ListChecks, Trash2 } from 'lucide-react'
import IngredientList from '@/components/IngredientList'
import Modal from '@/components/Modal'
import Button from '@/components/ui/Button'
import { useDeleteRecipe } from '@/hooks/useDeleteRecipe'
import type { Recipe } from '@/types/recipe'

type RecipeCardVariant = 'result' | 'history'

type RecipeCardProps = {
  recipe: Recipe
  variant?: RecipeCardVariant
}

/**
 * Displays a refined recipe. The 'result' variant (fresh scrape) is always
 * expanded; the 'history' variant starts collapsed and adds a delete action.
 */
export default function RecipeCard({ recipe, variant = 'result' }: RecipeCardProps) {
  const isHistory = variant === 'history'
  const [expanded, setExpanded] = useState(!isHistory)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const deleteRecipe = useDeleteRecipe()

  function handleConfirmDelete() {
    deleteRecipe.mutate(recipe.id, {
      onSuccess: () => setConfirmOpen(false),
    })
  }

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-card border border-line bg-surface shadow-sm">
      <div className="flex items-center gap-3 p-4 sm:p-6">
        <ChefHat size={24} className="shrink-0 text-accent" aria-hidden="true" />
        <h2 className="flex-1 text-xl font-semibold text-content sm:text-2xl">
          {recipe.title}
        </h2>
        {isHistory && (
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse recipe' : 'Expand recipe'}
            onClick={() => setExpanded((previous) => !previous)}
          >
            <ChevronDown
              size={18}
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </Button>
        )}
      </div>

      {expanded && (
        <div className="grid gap-6 border-t border-line p-4 sm:p-6 md:grid-cols-[5fr_7fr]">
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-content">
              <ListChecks size={18} className="text-accent" aria-hidden="true" />
              Ingredients
            </h3>
            <IngredientList ingredients={recipe.ingredients} />
          </div>
          <div className="border-t border-line pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-6">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-content">
              <FileText size={18} className="text-accent" aria-hidden="true" />
              Instructions
            </h3>
            <p className="whitespace-pre-line leading-relaxed text-content">
              {recipe.instructions}
            </p>
          </div>
        </div>
      )}

      {isHistory && (
        <div className="flex justify-end border-t border-line p-4 sm:p-6">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete
          </Button>
        </div>
      )}

      {isHistory && (
        <Modal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Delete recipe?"
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={deleteRecipe.isPending}
                onClick={handleConfirmDelete}
              >
                Delete
              </Button>
            </>
          }
        >
          <p className="text-content">
            Are you sure you want to delete &ldquo;{recipe.title}&rdquo; from your
            history? This cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  )
}
