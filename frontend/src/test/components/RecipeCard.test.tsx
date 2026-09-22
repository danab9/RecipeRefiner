import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecipeCard from "@/components/RecipeCard";
import { renderWithProviders } from "@/test/renderWithProviders";
import type { Recipe } from "@/types/recipe";

const { deleteRecipe } = vi.hoisted(() => ({ deleteRecipe: vi.fn() }));

vi.mock("@/api/recipes", () => ({
  scrapeRecipe: vi.fn(),
  getHistory: vi.fn(),
  deleteRecipe,
}));

// Sign the user in so `useMe` resolves to a User and the Edit action can appear.
vi.mock("@/api/auth", () => ({
  getMe: vi.fn().mockResolvedValue({ userId: 1, username: "test" }),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

const recipe: Recipe = {
  id: 1,
  title: "Test Recipe",
  ingredients: ["1 egg"],
  instructions: "Cook it well.",
};

describe("RecipeCard", () => {
  it("starts collapsed in the history variant and expands on toggle", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RecipeCard recipe={recipe} variant="history" />);

    expect(screen.queryByText("Ingredients")).not.toBeInTheDocument();
    expect(screen.queryByText("Instructions")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Expand recipe" }));

    expect(screen.getByText("Ingredients")).toBeInTheDocument();
    expect(screen.getByText("Instructions")).toBeInTheDocument();
    expect(screen.getByText("1 egg")).toBeInTheDocument();
  });

  it("opens the delete confirmation modal when Delete is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RecipeCard recipe={recipe} variant="history" />);

    // Delete now lives in the header and only shows once the card is expanded.
    await user.click(screen.getByRole("button", { name: "Expand recipe" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(
      screen.getByRole("dialog", { name: "Delete recipe?" }),
    ).toBeInTheDocument();
  });

  it("shows the Edit action for a signed-in user with a saved recipe", async () => {
    renderWithProviders(<RecipeCard recipe={recipe} variant="result" />);

    // `useMe` resolves async, so wait for the Edit button to appear.
    expect(
      await screen.findByRole("button", { name: "Edit" }),
    ).toBeInTheDocument();
  });

  it("hides the Edit action when the recipe has no backend id", async () => {
    renderWithProviders(
      <RecipeCard recipe={{ ...recipe, id: 0 }} variant="result" />,
    );

    // Give `useMe` time to resolve, then confirm Edit still never appears.
    await waitFor(() =>
      expect(screen.queryByText("Instructions")).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
  });

  it("renders the editor when Edit is clicked and returns to read view on Cancel", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RecipeCard recipe={recipe} variant="result" />);

    await user.click(await screen.findByRole("button", { name: "Edit" }));

    expect(screen.getByLabelText("Recipe title")).toHaveValue("Test Recipe");
    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByLabelText("Recipe title")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Test Recipe" }),
    ).toBeInTheDocument();
  });

  it("collapsing the chevron while editing returns to the collapsed read view", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RecipeCard recipe={recipe} variant="history" />);

    await user.click(screen.getByRole("button", { name: "Expand recipe" }));
    await user.click(await screen.findByRole("button", { name: "Edit" }));

    expect(screen.getByLabelText("Recipe title")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Collapse recipe" }));

    expect(screen.queryByLabelText("Recipe title")).not.toBeInTheDocument();
    expect(screen.queryByText("Ingredients")).not.toBeInTheDocument();
  });
});
