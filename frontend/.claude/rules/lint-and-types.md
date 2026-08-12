# Lint and typing discipline (frontend)

> Read this before editing anything under `frontend/src/` — referenced from `CLAUDE.md`.
> The `appliesTo` glob above is a hint about scope; Claude Code loads this file on demand when
> `CLAUDE.md` points to it, not automatically.

## The baseline rule

**Your change must build cleanly and add no type or lint errors.** Before you start and again before
you commit:

```bash
npm run typecheck   # tsc -b --noEmit
npm run lint        # eslint .
npm run test        # vitest run
npm run build       # tsc -b (type-check) then vite build — proves the bundle builds
```

Type checking is `tsc` via TS project references (`tsconfig.app.json` / `tsconfig.node.json`). It
runs standalone through `npm run typecheck` and as the first step of `npm run build`. `eslint` +
`prettier` are wired to `npm run lint` / `npm run format`; do not increase the problem count.

## TypeScript in React components

- Write **typed function components** in `.tsx`. Type props with an explicit `Props`
  interface/type; do not fall back to plain JS or untyped props.
- Type hooks precisely: a query hook should type its data and error, a mutation hook its variables
  and result. A `useQuery`/`useMutation` with inferred `any` data is a bug waiting to happen.
- **Reuse the shared types** in `src/types/` (`Recipe`, `LoginPayload`, `RegisterPayload`) instead
  of redeclaring shapes. A second, drifting definition of `Recipe` will drift out of sync with the
  API contract.
- Prefer precise types over `any`. When a value's type is genuinely unknown (an axios error, an
  external payload), use `unknown` and narrow, and say why in a short comment. Reserve `any` for the
  last resort.

## Forms and validation (React Hook Form + Zod)

- Define one **Zod** schema per form and **derive the type from it** (`type Values = z.infer<typeof
  schema>`); pass it to `useForm<Values>` via `zodResolver`. Do not maintain a hand-written type
  alongside the schema — they will drift.
- Where a schema validates an API payload, keep it consistent with the shared types in `src/types/`
  (`LoginPayload`, `RegisterPayload`). The schema is the runtime guard; the shared type is the
  compile-time contract — they must describe the same shape.
- Read errors from RHF's typed `formState.errors`; don't reach around the resolver with ad-hoc checks.

## TanStack Query & Zustand typing

- **Server state belongs to TanStack Query, client/UI state to Zustand** — keep the boundary clean.
  Do not mirror server data into a Zustand store; type each store to only the client state it owns.
- Type Zustand stores with an explicit state + actions interface; a new field on the state must be
  added to that interface.
- API functions in `src/api/` should type both the request payload and the response they read from,
  so a backend contract change surfaces at compile time rather than at runtime. Query/mutation hooks
  inherit those types.
- Keep query keys consistent and typed (e.g. `['me']`, `['history']`); mutations must invalidate the
  correct keys.

## Async and error handling

- Every request needs an explicit failure path. Surface `isPending` / `isError` from Query in the
  UI rather than assuming success. `useMe` is the reference: a 401 resolves to a logged-out state
  (`null`) and its `isPending` gates "not known yet" vs "not logged in".
- Do not swallow errors silently where the user needs feedback — surface a user-facing message.

## Things that will bite you

- **CSRF/credentials are not optional.** They are configured once in `src/lib/axios.ts`
  (`withCredentials` + the `X-CSRFToken` interceptor). Building a second axios instance, or using
  bare `fetch` for an authenticated call, compiles fine and fails only at runtime (403 from Django).
  Always go through the shared instance via `src/api/`.
- **`tsc`, `eslint`, and `vitest` are the gates.** A wrong type or a misused hook that the compiler
  doesn't catch reaches the browser — keep types tight and follow the rules of hooks (ESLint's
  `react-hooks` rules will flag violations; don't disable them). Add/adjust Vitest + RTL tests for
  non-trivial logic and keep the suite green.
- **Prod vs dev base path.** `vite.config.ts` sets `base: "/static/"` for builds. If assets 404 in
  production but work in `npm run dev`, this is why — don't "fix" it by changing the base without
  understanding that Django/WhiteNoise serves the build under `/static/`.
- **Tailwind v4 has no `tailwind.config.js` by default.** Styling is driven by `@import "tailwindcss";`
  in `src/index.css` and the `@tailwindcss/vite` plugin. Don't add a PostCSS/config chain unless a
  custom theme genuinely needs one.
