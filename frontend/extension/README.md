# RecipeRefiner browser extension

A Manifest V3 browser extension for Chrome, Firefox and Firefox for Android. One
build works in all three. Open a recipe page, click the toolbar icon, and
the popup gives you two actions on a supported site:

- **Quick refine** — scrapes the current page and shows the refined recipe right
  in the popup. No copy-pasting a URL into the web app.
- **Open in new page** — opens the full web app in a new tab at
  `https://<host>/?url=<current-page>`, which pre-fills the URL input and
  auto-refines, so you get the complete site experience (nav, larger card, and,
  if you're logged in there, history).

The in-popup Quick refine is **scrape-only**: it refines the page you're on
anonymously. No login, no history. (Those need cross-origin session cookies — a
possible v2.) The full app opened by "Open in new page" runs on its own origin,
so a session there works normally.

## How it works (the parts, and why)

| Part | File | Role |
|------|------|------|
| Manifest | `public/manifest.json` | Declares the extension: its popup, permissions, icons. The browser reads this to decide what the code may do. Chrome ignores `browser_specific_settings`, which holds the Firefox settings. |
| Popup UI | `src/main.tsx`, `src/RecipePopup.tsx` | A normal React page shown when you click the icon. Runs on a `chrome-extension://<id>` or `moz-extension://<id>` origin. |
| Read the tab | `src/getActiveTabUrl.ts` | Wraps `chrome.tabs.query` to get the active tab's URL. |
| The scrape | reuses `@/api/recipes` + `@/components/RecipeCard` | Same call and card as the web app — no duplicated UI. |
| Open the full app | `chrome.tabs.create` in `src/RecipePopup.tsx` | "Open in new page" opens `<host>/?url=<current-page>` in a new tab. Needs **no** extra permission — only *reading* tab properties needs `activeTab`/`tabs`. |

Two permissions matter, both in `manifest.json`:

- **`activeTab`** — grants access to the tab you're on *at the moment you click
  the icon* (including its URL). Privacy-friendly: no "read all your browsing"
  warning.
- **`host_permissions`** for the API host — the popup calling the API is a
  *cross-origin* request, which CORS would normally block. Browsers **exempt
  extension requests to hosts in `host_permissions`** from CORS enforcement.
  **That is why no backend CORS change is needed.** This host must match
  `VITE_API_URL` in `../.env.extension`. Firefox users can revoke this permission
  in `about:addons`; Quick refine then shows an error, and "Open in new page"
  still works.

Why no cookies/CSRF: the scrape endpoint (`POST /api/`) is anonymous and, via
DRF's `@api_view`, CSRF-exempt for anonymous requests. It only saves history when
a user is logged in — which the extension never is. That is enforced in
`src/lib/axios.ts`: `VITE_SEND_CREDENTIALS=false` in `../.env.extension` sets
`withCredentials: false` and skips the `X-CSRFToken` header. Without it, the browser would attach the site's session
cookie (the host is in `host_permissions`), DRF would treat a user logged into
the site as authenticated and enforce CSRF, and the popup — which cannot read the
site's `csrftoken` — would get a 403.

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

## Load into Firefox

1. Go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on** and select `extension/dist/manifest.json`.
3. In `about:addons`, open Recipe Refiner → **Permissions** and check that access
   to the API host is on. Temporary loading skips the normal install prompt.
4. Open a recipe page, click the puzzle icon in the toolbar, then Recipe Refiner.

A temporary add-on is removed when Firefox closes.

## Load into Firefox for Android

Needs `adb` on your `PATH`, USB debugging on the phone, and Firefox Nightly with
**Remote debugging via USB** turned on in its settings.

```bash
adb devices   # note the device ID; it must show "device", not "unauthorized"
```

Open any tab on the phone, then from `frontend/` (blocks until Ctrl+C):

```bash
npx --yes web-ext@8 run -t firefox-android --source-dir extension/dist --adb-device <DEVICE_ID> --firefox-apk org.mozilla.fenix
```

Open a recipe page, then **Firefox menu → Extensions → Recipe Refiner**. To see
errors, open `about:debugging` on desktop Firefox and connect to the phone.

## Verify

- `npm run typecheck`, `npm run lint`, `npm run build:extension` — all clean.
- `npx --yes web-ext@8 lint --source-dir extension/dist` — 0 errors. Two
  `innerHTML` warnings from the bundle are expected.
- In Chrome, open the popup's DevTools (right-click the popup → Inspect):
  the Network tab shows `POST https://<host>/api/` → `200` with `{ recipe }`,
  and no CORS error in the Console.
- On a browser page (`chrome://`, `about:`) or a blank tab, the popup shows
  "Refine unavailable".
- On a page the scraper can't parse, the backend returns an error and the popup
  shows an alert with a **Try again** button.
- On a phone, the popup has no sideways scrolling and the new tab from "Open in
  new page" isn't hidden behind it.

## Publish to Firefox Add-ons (AMO)

Bump `version` in `public/manifest.json` for each new release. The add-on `id`
must never change after the first upload.

AMO requires the source code because the bundle is minified. From `frontend/`,
on the commit you are releasing:

```bash
npm ci
npm run build:extension
npx --yes web-ext@8 build --source-dir extension/dist --artifacts-dir ../../reciperefiner-firefox --overwrite-dest
```

Then from the repo root:

```bash
git archive --format=zip -o ../reciperefiner-firefox/source.zip HEAD frontend
```

Upload the `web-ext build` zip as the add-on and `source.zip` as the source code.
Select both Firefox and Firefox for Android. The privacy policy is at
`https://reciperefiner.onrender.com/privacy`.

Paste this into the notes for reviewers:

```text
Build steps (Node 22, npm, any OS):
  cd frontend
  npm ci
  npm run build:extension
The output is in frontend/extension/dist. The source zip contains only frontend/,
because the extension has no code outside it.

To test: open https://www.allrecipes.com, open any recipe, then open the add-on.
It needs no account. The tab URL is sent to our server only when the user clicks
a button, which is the add-on's main function.

The innerHTML warnings in the linter come from bundled libraries (React DOM).
Our own source does not use innerHTML.
```
