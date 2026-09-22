import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IngredientList from "@/components/IngredientList";

describe("IngredientList", () => {
  it("toggles a row between unchecked and checked when clicked", async () => {
    const user = userEvent.setup();
    render(<IngredientList ingredients={["2 cups flour", "1 tsp salt"]} />);

    const row = screen.getByRole("button", { name: "2 cups flour" });
    expect(row).toHaveAttribute("aria-pressed", "false");
    expect(row).not.toHaveClass("line-through");

    await user.click(row);

    expect(row).toHaveAttribute("aria-pressed", "true");
    expect(row.querySelector("span")).toHaveClass("line-through");

    await user.click(row);

    expect(row).toHaveAttribute("aria-pressed", "false");
  });
});
