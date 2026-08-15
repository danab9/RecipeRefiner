import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

type UiState = {
  /** Active color theme. Client/UI state only — never server data. */
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

/** Initial theme: a persisted choice wins, else follow the OS preference. */
function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: getInitialTheme(),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "reciperefiner-ui" },
  ),
);
