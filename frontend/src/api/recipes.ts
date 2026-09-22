import api from "@/lib/axios";
import type { Recipe } from "@/types/recipe";

/** Scrape and refine a recipe from a URL. Saves to history when logged in. */
export async function scrapeRecipe(url: string): Promise<Recipe> {
  const { data } = await api.post<{ recipe: Recipe }>("/", { url });
  return data.recipe;
}

/** The logged-in user's saved recipes (backend caps at 20). */
export async function getHistory(): Promise<Recipe[]> {
  const { data } = await api.get<{ recipes: Recipe[] }>("/history/");
  return data.recipes;
}

/** Remove a saved recipe by id. */
export async function deleteRecipe(id: number): Promise<void> {
  await api.delete(`/delete/${id}`);
}
