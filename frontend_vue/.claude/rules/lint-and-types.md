---
description: 'Lint and TypeScript discipline for the RecipeRefiner Vue 3 frontend. Read before editing files under src/.'
appliesTo: 'src/**'
---

# Lint and typing discipline (frontend)

> Read this before editing anything under `frontend_vue/src/` — referenced from `CLAUDE.md`.
> The `appliesTo` glob above is a hint about scope; Claude Code loads this file on demand when
> `CLAUDE.md` points to it, not automatically.

## The baseline rule

**Your change must build cleanly and add no type errors.** Before you start and again before you
commit:

```bash
npm run build       # runs `vue-tsc -b` (type-check) then `vite build`
```

Type checking is part of the build; there is **no separate `typecheck` script** yet. To type-check
without producing a bundle: `npx vue-tsc -b --noEmit`.

`eslint` and `eslint.config.mjs` are present but **not** wired to an npm script. If your change is
non-trivial, run `npx eslint .` on the files you touched and do not increase the problem count.

> **Recommended follow-up:** add `"typecheck": "vue-tsc -b --noEmit"` and `"lint": "eslint ."` to
> `package.json` so validation is one documented command. Propose it rather than silently bundling
> it into an unrelated change.

## TypeScript in Vue SFCs

- Use `<script setup lang="ts">` — this is the project convention. Keep new components typed; do not
  fall back to plain JS.
- Type component `props` and `emits` explicitly (`defineProps<...>()`, `defineEmits<...>()`).
- **Reuse the shared types** in `src/store/store.ts` (`Recipe`, `LoginPayload`, `RegisterPayload`)
  instead of redeclaring shapes. A second, drifting definition of `Recipe` is a bug waiting to
  happen.
- Prefer precise types over `any`. When a value's type is genuinely unknown (an axios error, an
  external payload), use `unknown` and narrow, and say why in a short comment. Reserve `any` for the
  last resort.

## Pinia store typing

- The store state is typed via `StoreType`; keep it accurate when you add state. A new field on the
  state object must be added to the type.
- Actions that call the API should type both the request payload and the response they read from, so
  a backend contract change surfaces at compile time rather than at runtime.

## Async and error handling

- Every `await`ed request needs an explicit failure path. `checkUser()` is the reference: it treats
  any failure/401 as "logged out" and always resolves `authResolved`. Don't leave a rejected promise
  unhandled.
- Do not swallow errors silently where the user needs feedback — surface a user-facing message.

## Things that will bite you

- **CSRF/credentials are not optional.** Omitting `withCredentials` or the `X-CSRFToken` header
  compiles fine and fails only at runtime (403 from Django). Follow the pattern in every store action.
- **`vue-tsc` is the only type gate.** There is no test suite yet, so a wrong type that `vue-tsc`
  doesn't catch (e.g. an `any` you introduced) reaches the browser. Keep types tight.
- **Prod vs dev base path.** `vite.config.ts` sets `base: "/static/"` for builds. If assets 404 in
  production but work in `npm run dev`, this is why — don't "fix" it by changing the base without
  understanding that Django/WhiteNoise serves the build under `/static/`.
