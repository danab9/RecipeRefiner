import { useEffect } from "react";
import { useUiStore } from "@/stores/uiStore";

/**
 * Reflects the UI store's theme onto the <html> element as a `.dark` class, which
 * is what the Tailwind `dark:` variant and the CSS token overrides key off.
 */
export function useThemeEffect() {
  const theme = useUiStore((state) => state.theme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
}
