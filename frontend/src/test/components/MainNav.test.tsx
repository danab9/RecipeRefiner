import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/renderWithProviders";
import MainNav from "@/components/MainNav";
import { useMe } from "@/hooks/useMe";
import { useHistory } from "@/hooks/useHistory";
import { useLogout } from "@/hooks/useLogout";
import type { Recipe, User } from "@/types/recipe";

vi.mock("@/hooks/useMe", () => ({ useMe: vi.fn() }));
vi.mock("@/hooks/useHistory", () => ({ useHistory: vi.fn() }));
vi.mock("@/hooks/useLogout", () => ({ useLogout: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...rest }: { to: string; children: ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}));

const mockedUseMe = vi.mocked(useMe);
const mockedUseHistory = vi.mocked(useHistory);
const mockedUseLogout = vi.mocked(useLogout);

function makeRecipe(id: number): Recipe {
  return { id, title: `Recipe ${id}`, ingredients: [], instructions: "" };
}

describe("MainNav", () => {
  it("shows a login link and no logout button when logged out", () => {
    mockedUseMe.mockReturnValue({ data: null, isPending: false } as ReturnType<
      typeof useMe
    >);
    mockedUseHistory.mockReturnValue({ data: undefined } as ReturnType<
      typeof useHistory
    >);
    mockedUseLogout.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useLogout>);

    renderWithProviders(<MainNav />);

    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /logout/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the greeting, history link, and saved-count badge when logged in", () => {
    const user: User = { userId: 1, username: "dana" };
    mockedUseMe.mockReturnValue({ data: user, isPending: false } as ReturnType<
      typeof useMe
    >);
    mockedUseHistory.mockReturnValue({
      data: [makeRecipe(1), makeRecipe(2), makeRecipe(3)],
    } as ReturnType<typeof useHistory>);
    mockedUseLogout.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useLogout>);

    renderWithProviders(<MainNav />);

    expect(screen.getByText(/hello dana/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /history/i })).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
