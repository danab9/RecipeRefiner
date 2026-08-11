import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { Link2 } from 'lucide-react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import TextField from '@/components/ui/TextField'
import { useScrapeRecipe } from '@/hooks/useScrapeRecipe'
import { urlSchema } from '@/schemas/recipe'
import type { UrlValues } from '@/schemas/recipe'
import type { Recipe } from '@/types/recipe'

type UrlFormProps = {
  onResult: (recipe: Recipe) => void
}

const FALLBACK_ERROR_MESSAGE =
  "Couldn’t refine that URL. Please try again."

/** Form for submitting a recipe URL to be scraped and refined. */
export default function UrlForm({ onResult }: UrlFormProps) {
  const scrapeRecipe = useScrapeRecipe()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UrlValues>({ resolver: zodResolver(urlSchema) })

  async function onSubmit(values: UrlValues) {
    try {
      const recipe = await scrapeRecipe.mutateAsync(values.url)
      onResult(recipe)
      reset()
    } catch {
      // Error is surfaced below via scrapeRecipe.isError / error.
    }
  }

  const errorMessage = isAxiosError(scrapeRecipe.error)
    ? (scrapeRecipe.error.response?.data?.error ?? FALLBACK_ERROR_MESSAGE)
    : FALLBACK_ERROR_MESSAGE

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <TextField
            label="Recipe URL"
            placeholder="Paste a recipe URL…"
            type="url"
            icon={<Link2 size={18} aria-hidden="true" />}
            error={errors.url?.message}
            {...register('url')}
          />
        </div>
        <Button type="submit" loading={scrapeRecipe.isPending} className="sm:mt-7">
          Refine
        </Button>
      </div>
      {scrapeRecipe.isError && <Alert variant="error">{errorMessage}</Alert>}
    </form>
  )
}
