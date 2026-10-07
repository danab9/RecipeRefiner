import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Link2 } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { useScrapeRecipe } from "@/hooks/useScrapeRecipe";
import { urlSchema } from "@/schemas/recipe";
import type { UrlValues } from "@/schemas/recipe";
import type { Recipe } from "@/types/recipe";

type UrlFormProps = {
  onResult: (recipe: Recipe) => void;
  /** When set (e.g. from a `?url=` link), pre-fills the input and auto-refines once. */
  initialUrl?: string;
};

const FALLBACK_ERROR_MESSAGE = "Couldn’t refine that URL. Please try again.";

/** Form for submitting a recipe URL to be scraped and refined. */
export default function UrlForm({ onResult, initialUrl }: UrlFormProps) {
  const scrapeRecipe = useScrapeRecipe();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UrlValues>({
    resolver: zodResolver(urlSchema),
    defaultValues: { url: initialUrl ?? "" },
  });

  async function onSubmit(values: UrlValues) {
    try {
      const recipe = await scrapeRecipe.mutateAsync(values.url);
      onResult(recipe);
      // Clear explicitly (not reset()) so we don't repopulate a seeded initialUrl.
      reset({ url: "" });
    } catch {
      // Error is surfaced below via scrapeRecipe.isError / error.
    }
  }

  // Auto-refine once when an initial URL is provided. Zod still validates on submit,
  // so a bad param just shows the field error instead of scraping.
  const autoSubmitted = useRef(false);
  useEffect(() => {
    if (initialUrl && !autoSubmitted.current) {
      autoSubmitted.current = true;
      void handleSubmit(onSubmit)();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl]);

  const errorMessage = isAxiosError(scrapeRecipe.error)
    ? (scrapeRecipe.error.response?.data?.error ?? FALLBACK_ERROR_MESSAGE)
    : FALLBACK_ERROR_MESSAGE;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <TextField
            label="Recipe URL"
            placeholder="Paste a recipe URL…"
            type="url"
            icon={<Link2 size={18} aria-hidden="true" />}
            error={errors.url?.message}
            {...register("url")}
          />
        </div>
        <Button
          type="submit"
          loading={scrapeRecipe.isPending}
          className="sm:mt-7"
        >
          Refine
        </Button>
      </div>
      {scrapeRecipe.isError && <Alert variant="error">{errorMessage}</Alert>}
    </form>
  );
}
