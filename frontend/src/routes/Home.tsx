import { useState } from 'react'
import RecipeCard from '@/components/RecipeCard'
import UrlForm from '@/components/UrlForm'
import type { Recipe } from '@/types/recipe'

/** The landing page: paste a URL, get back a clean, ad-free recipe. */
export default function Home() {
  const [result, setResult] = useState<Recipe | null>(null)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-content sm:text-4xl">
          Recipe Refiner
        </h1>
        <p className="mt-2 text-muted">
          Paste a cluttered recipe link and get a clean, ad-free recipe.
        </p>
      </div>

      <UrlForm onResult={setResult} />

      {result && (
        <div className="mt-4">
          <RecipeCard recipe={result} variant="result" />
        </div>
      )}
    </div>
  )
}
