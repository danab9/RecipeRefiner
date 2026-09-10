import { isAxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { ChefHat, Sparkles } from "lucide-react";
import RecipeCard from "@/components/RecipeCard";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useScrapeRecipe } from "@/hooks/useScrapeRecipe";
import { getActiveTabUrl } from "./getActiveTabUrl";
import { isApprovedSite } from "./isApprovedSite";

const FALLBACK_ERROR_MESSAGE = "Couldn’t refine this page. Please try again.";

/**
 * The extension popup. It reads the active tab's URL, tells the user whether
 * this site is supported, and refines the page only when they click Refine.
 * Reuses the app's `useScrapeRecipe` mutation and `RecipeCard`.
 */
export default function RecipePopup() {
  // Read the active tab's URL asynchronously (chrome.tabs is promise-based).
  const tabQuery = useQuery({
    queryKey: ["activeTabUrl"],
    queryFn: getActiveTabUrl,
    staleTime: Infinity,
  });

  const tabUrl = tabQuery.data;
  // The single availability boolean: is this site in the approved list?
  const available = isApprovedSite(tabUrl);

  const scrape = useScrapeRecipe();

  const errorMessage = isAxiosError(scrape.error)
    ? (scrape.error.response?.data?.error ?? FALLBACK_ERROR_MESSAGE)
    : FALLBACK_ERROR_MESSAGE;

  function handleRefine() {
    if (available && tabUrl) {
      scrape.mutate(tabUrl);
    }
  }

  return (
    <div className="recipe-popup flex flex-col gap-4 p-4">
      <header className="flex items-center gap-2">
        <ChefHat size={20} className="text-accent" aria-hidden="true" />
        <h1 className="text-base font-semibold text-content">Recipe Refiner</h1>
      </header>

      {tabQuery.isPending && <Spinner />}

      {/* Availability + action. Hidden once a recipe card is shown. */}
      {!tabQuery.isPending && !scrape.isSuccess && (
        <div className="flex flex-col gap-2">
          <p
            className={`text-sm font-medium ${
              available ? "text-accent" : "text-muted"
            }`}
          >
            {available ? "Refine available" : "Refine unavailable"}
          </p>

          {available ? (
            <Button
              onClick={handleRefine}
              loading={scrape.isPending}
              size="lg"
              className="inline-flex h-9 items-center rounded-control bg-accent px-3 text-sm font-medium text-on-accent hover:bg-accent-hover"
            >
              {!scrape.isPending && <Sparkles size={18} aria-hidden="true" />}
              {scrape.isError ? "Try again" : "Refine this recipe"}
            </Button>
          ) : (
            <p className="text-xs text-muted">
              This site isn’t supported. Open a recipe from a supported site.
            </p>
          )}
        </div>
      )}

      {scrape.isError && <Alert variant="error">{errorMessage}</Alert>}

      {scrape.isSuccess && <RecipeCard recipe={scrape.data} variant="result" />}
    </div>
  );
}
