import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import "./index.css";
import { queryClient } from "@/lib/queryClient";
import { router } from "@/router";

// Apply the persisted theme before first paint to avoid a light/dark flash.
try {
  const stored = localStorage.getItem("reciperefiner-ui");
  const theme = stored ? JSON.parse(stored)?.state?.theme : undefined;
  const prefersDark =
    theme === "dark" ||
    (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", prefersDark);
} catch {
  // Non-fatal: the theme hook will reconcile once React mounts.
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
