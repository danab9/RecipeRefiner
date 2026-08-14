# CLAUDE.md — frontend

Placeholder. This file gives Claude Code frontend-specific guidance, scoped to `frontend/`. It's **additive** to the repo-root `CLAUDE.md` — a file under `frontend/` sees both — so cover only what's specific to the SPA and don't repeat the root doc.

**Frontend owner: please fill this in yourself.** Easiest path: from `frontend/`, run `/init` in Claude Code and let it draft from the actual code, then trim.

Worth covering: the Vite `base` flip (`/static/` for build vs `/` for dev) and why; the session-cookie + CSRF request contract (`withCredentials`, the `X-CSRFToken` header, where the token comes from); the single Pinia store and `checkUser()` auth model; commands (`npm run dev` / `build` / `preview`); and the `src/plugins/axios.ts` unused-`apiClient` wart. See the "Auth is Django session cookies + CSRF" section in the root doc for the contract you must honor.
