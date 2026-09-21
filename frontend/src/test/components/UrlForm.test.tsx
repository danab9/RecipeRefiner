import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UrlForm from "@/components/UrlForm";
import { renderWithProviders } from "@/test/renderWithProviders";
import type { Recipe } from "@/types/recipe";

const { scrapeRecipe } = vi.hoisted(() => ({ scrapeRecipe: vi.fn() }));

vi.mock("@/api/recipes", () => ({
  scrapeRecipe,
  getHistory: vi.fn(),
  deleteRecipe: vi.fn(),
}));

const recipe: Recipe = {
  id: 1,
  title: "Test Recipe",
  ingredients: ["1 egg"],
  instructions: "Cook it.",
};

describe("UrlForm", () => {
  it("shows a validation error and does not call onResult for an invalid URL", async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();
    renderWithProviders(<UrlForm onResult={onResult} />);

    await user.type(screen.getByLabelText("Recipe URL"), "not-a-url");
    await user.click(screen.getByRole("button", { name: "Refine" }));

    expect(
      await screen.findByText("Enter a valid http(s) URL"),
    ).toBeInTheDocument();
    expect(scrapeRecipe).not.toHaveBeenCalled();
    expect(onResult).not.toHaveBeenCalled();
  });

  it("calls onResult with the scraped recipe for a valid URL", async () => {
    scrapeRecipe.mockResolvedValueOnce(recipe);
    const user = userEvent.setup();
    const onResult = vi.fn();
    renderWithProviders(<UrlForm onResult={onResult} />);

    await user.type(
      screen.getByLabelText("Recipe URL"),
      "https://example.com/recipe",
    );
    await user.click(screen.getByRole("button", { name: "Refine" }));

    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith(recipe);
    });
  });
});
