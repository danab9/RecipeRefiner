import { useState } from "react";
import { Circle, CircleCheck } from "lucide-react";

type IngredientListProps = {
  ingredients: string[];
};

/** Checklist of recipe ingredients; checked state is local, ephemeral UI state. */
export default function IngredientList({ ingredients }: IngredientListProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  function toggle(index: number) {
    setChecked((previous) => ({ ...previous, [index]: !previous[index] }));
  }

  return (
    <ul className="flex flex-col">
      {ingredients.map((ingredient, index) => {
        const isChecked = Boolean(checked[index]);
        return (
          <li key={index}>
            <button
              type="button"
              aria-pressed={isChecked}
              onClick={() => toggle(index)}
              className="flex min-h-11 w-full items-center gap-2 rounded-control px-2 py-2 text-left hover:bg-content/5 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              {isChecked ? (
                <CircleCheck
                  size={20}
                  className="shrink-0 text-accent"
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  size={20}
                  className="shrink-0 text-muted"
                  aria-hidden="true"
                />
              )}
              <span
                className={
                  isChecked ? "text-muted line-through" : "text-content"
                }
              >
                {ingredient}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
