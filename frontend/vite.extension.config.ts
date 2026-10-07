import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

/**
 * Vite build for the Chrome (Manifest V3) extension popup.
 *
 * It is a second build target of this same package, not a separate app: the
 * "@" alias points back into ../src so the popup reuses the app's components,
 * hooks, axios instance, and Tailwind tokens with no duplication.
 *
 * Build it with:  npm run build:extension
 * Output goes to  extension/dist/  — the folder you "Load unpacked" in Chrome.
 */
export default defineConfig({
  // The extension is its own mini-site rooted here (its own index.html).
  root: fileURLToPath(new URL('./extension', import.meta.url)),
  // Env lives in the package root; `--mode extension` loads `.env.extension`
  // there, so it never affects the normal app dev/prod builds.
  envDir: fileURLToPath(new URL('.', import.meta.url)),
  // Extension pages resolve assets by relative path, not from Django's /static/.
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      // Reuse the app source: `@/components/...`, `@/hooks/...`, etc.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL('./extension/dist', import.meta.url)),
    emptyOutDir: true,
  },
})
