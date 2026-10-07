import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/renderWithProviders";
import LoginForm from "@/components/LoginForm";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

const { login } = vi.hoisted(() => ({ login: vi.fn() }));

vi.mock("@/api/auth", () => ({
  login,
}));

describe("LoginForm", () => {
  it("shows validation errors and does not call the api when submitted empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm onSwitchToSignUp={() => {}} />);

    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(
      await screen.findByText(/username must be at least 3 characters/i),
    ).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("calls the login api and navigates home on success", async () => {
    login.mockResolvedValueOnce({ userId: 1, username: "chef" });
    const user = userEvent.setup();
    renderWithProviders(<LoginForm onSwitchToSignUp={() => {}} />);

    await user.type(screen.getByLabelText("Username"), "chef");
    await user.type(screen.getByLabelText("Password"), "secretpw");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith(
        { username: "chef", password: "secretpw" },
        expect.anything(),
      );
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
    });
  });
});
