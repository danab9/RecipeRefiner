import { Moon, Sun } from "lucide-react";
import Button from "@/components/ui/Button";
import { useUiStore } from "@/stores/uiStore";

/** Toggles between light and dark theme, persisted via the UI store. */
export default function ThemeToggle() {
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  const isLight = theme === "light";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
    >
      {isLight ? (
        <Moon size={18} aria-hidden="true" />
      ) : (
        <Sun size={18} aria-hidden="true" />
      )}
    </Button>
  );
}
