import { useState } from "react";
import {
  Check,
  ChefHat,
  ChevronDown,
  FileText,
  ListChecks,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Button from "@/components/ui/Button";
import type { Recipe } from "@/types/recipe";
import type { RecipeCardVariant } from "@/components/RecipeCard";

type RecipeCardEditorProps = {
  recipe: Recipe;
  variant: RecipeCardVariant;
  /** Called with the working copy when the user submits "Update recipe". */
  onUpdate: (edited: Omit<Recipe, "id">) => void;
  /** Discard edits and return to the read view (stay expanded). */
  onCancel: () => void;
  /** Collapse the card from edit mode; treated as a cancel by the parent. */
  onCollapse: () => void;
};

// Shared with the bare inputs/textarea here; mirrors the input inside TextField.
const fieldClasses =
  "w-full rounded-control border border-line bg-surface text-content placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

/**
 * Inline edit surface for a RecipeCard. Owns the `editedRecipe` working copy and
 * every field handler; fully replaces the card interior while editing. Persisting
 * is a future stage — for now the parent only logs the submitted recipe.
 */
export default function RecipeCardEditor({
  recipe,
  variant,
  onUpdate,
  onCancel,
  onCollapse,
}: RecipeCardEditorProps) {
  const isHistory = variant === "history";
  const [editedRecipe, setEditedRecipe] = useState<Omit<Recipe, "id">>({
    title: recipe.title,
    ingredients: [...recipe.ingredients],
    instructions: recipe.instructions,
  });

  function setTitle(title: string) {
    setEditedRecipe((previous) => ({ ...previous, title }));
  }

  function setInstructions(instructions: string) {
    setEditedRecipe((previous) => ({ ...previous, instructions }));
  }

  function changeIngredient(index: number, value: string) {
    setEditedRecipe((previous) => ({
      ...previous,
      ingredients: previous.ingredients.map((ingredient, current) =>
        current === index ? value : ingredient,
      ),
    }));
  }

  function removeIngredient(index: number) {
    setEditedRecipe((previous) => ({
      ...previous,
      ingredients: previous.ingredients.filter(
        (_, current) => current !== index,
      ),
    }));
  }

  function addIngredient() {
    setEditedRecipe((previous) => ({
      ...previous,
      ingredients: [...previous.ingredients, ""],
    }));
  }

  return (
    <>
      <div className="flex items-center gap-3 p-4 sm:p-6">
        <ChefHat
          size={24}
          className="shrink-0 text-accent"
          aria-hidden="true"
        />
        <input
          type="text"
          aria-label="Recipe title"
          value={editedRecipe.title}
          onChange={(event) => setTitle(event.target.value)}
          className={`h-12 flex-1 text-xl font-semibold sm:text-2xl ${fieldClasses} px-3`}
        />
        <Button variant="primary" size="sm" onClick={() => onUpdate(editedRecipe)}>
          <Check size={16} aria-hidden="true" />
          Update
        </Button>
        <Button variant="danger" size="sm" onClick={onCancel}>
          <X size={16} aria-hidden="true" />
          Cancel
        </Button>
        {isHistory && (
          <Button
            variant="ghost"
            size="sm"
            aria-expanded
            aria-label="Collapse recipe"
            onClick={onCollapse}
          >
            <ChevronDown
              size={18}
              className="rotate-180 transition-transform"
              aria-hidden="true"
            />
          </Button>
        )}
      </div>

      <div className="grid gap-6 border-t border-line p-4 sm:p-6 md:grid-cols-[5fr_7fr]">
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-content">
            <ListChecks size={18} className="text-accent" aria-hidden="true" />
            Ingredients
          </h3>
          <ul className="flex flex-col gap-2">
            {editedRecipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  aria-label={`Ingredient ${index + 1}`}
                  value={ingredient}
                  onChange={(event) =>
                    changeIngredient(index, event.target.value)
                  }
                  className={`h-11 flex-1 ${fieldClasses} px-3`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Remove ingredient"
                  onClick={() => removeIngredient(index)}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={addIngredient}
          >
            <Plus size={16} aria-hidden="true" />
            Add ingredient
          </Button>
        </div>
        <div className="flex flex-col border-t border-line pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-6">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-content">
            <FileText size={18} className="text-accent" aria-hidden="true" />
            Instructions
          </h3>
          <textarea
            aria-label="Instructions"
            value={editedRecipe.instructions}
            onChange={(event) => setInstructions(event.target.value)}
            className={`min-h-48 flex-1 resize-y p-3 leading-relaxed ${fieldClasses}`}
          />
        </div>
      </div>
    </>
  );
}
