import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Production build assets are served by Django/WhiteNoise under /static/.
  // Dev server stays at root so `npm run dev` works normally.
  base: command === "build" ? "/static/" : "/",
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
