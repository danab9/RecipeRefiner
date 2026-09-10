# RecipeRefiner Chrome extension

A Manifest V3 browser extension. Open a recipe page, click the toolbar icon, and
the popup shows the refined recipe — no copy-pasting a URL into the web app.

It is **scrape-only**: it refines the page you're on anonymously. No login, no
history. (Those need cross-origin session cookies — a possible v2.)

## How it works (the parts, and why)

| Part | File | Role |
|------|------|------|
| Manifest | `public/manifest.json` | Declares the extension: its popup, permissions, icons. Chrome reads this to decide what the code may do. |
| Popup UI | `src/main.tsx`, `src/RecipePopup.tsx` | A normal React page shown when you click the icon. Runs on a `chrome-extension://<id>` origin. |
| Read the tab | `src/getActiveTabUrl.ts` | Wraps `chrome.tabs.query` to get the active tab's URL. |
| The scrape | reuses `@/api/recipes` + `@/components/RecipeCard` | Same call and card as the web app — no duplicated UI. |

Two permissions matter, both in `manifest.json`:

- **`activeTab`** — grants access to the tab you're on *at the moment you click
  the icon* (including its URL). Privacy-friendly: no "read all your browsing"
  warning.
- **`host_permissions`** for the API host — the popup calling the API is a
  *cross-origin* request, which CORS would normally block. Chrome **exempts
  extension requests to hosts in `host_permissions`** from CORS enforcement.
  **That is why no backend CORS change is needed.** This host must match
  `VITE_API_URL` in `../.env.extension`.

Why no cookies/CSRF: the scrape endpoint (`POST /api/`) is anonymous and, via
DRF's `@api_view`, CSRF-exempt for anonymous requests. It only saves history when
a user is logged in — which the extension never is.

We deliberately use **no content script** (we only need the URL, not the page's
DOM) and **no background service worker** (all work happens while the popup is
open).

## Configure

The backend host lives in **two** places and they must match:

1. `../.env.extension` → `VITE_API_URL=https://<host>/api`
2. `public/manifest.json` → `"host_permissions": ["https://<host>/*"]`

Currently set to `https://reciperefiner.onrender.com`.

## Build

From `frontend/`:

```bash
npm install            # once (pulls @types/chrome)
npm run build:extension
```

Output lands in `extension/dist/` — that folder **is** the unpacked extension.

## Load into Chrome

1. Go to `chrome://extensions`.
2. Turn on **Developer mode** (top-right).
3. Click **Load unpacked** and select `frontend/extension/dist/`.
4. Pin the extension, open a recipe page, and click the icon.

After any code change: `npm run build:extension` again, then click the **reload**
(↻) icon on the extension's card. (No hot reload — that's the trade-off for a
transparent, framework-magic-free setup.)

## Verify

- `npm run typecheck`, `npm run lint`, `npm run build:extension` — all clean.
- In Chrome, open the popup's DevTools (right-click the popup → Inspect):
  the Network tab shows `POST https://<host>/api/` → `200` with `{ recipe }`,
  and no CORS error in the Console.
- On a `chrome://` / blank tab the popup shows the "open a recipe page" guard.
- On a page the scraper can't parse, the backend returns an error and the popup
  shows an alert with a **Try again** button.
