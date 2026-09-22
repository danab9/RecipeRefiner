/**
 * URL of the tab the user is currently looking at.
 *
 * Uses the `chrome.tabs` API. The `activeTab` permission (declared in
 * manifest.json) grants read access to the active tab — including its URL —
 * when the user invokes the extension by clicking the toolbar icon.
 *
 * Returns `null` when there is no readable URL (for example a browser page such
 * as chrome:// or the new-tab page). Returning `null` (not `undefined`) keeps
 * this usable as a TanStack Query `queryFn`, which rejects `undefined` results.
 */
export async function getActiveTabUrl(): Promise<string | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return tab?.url ?? null
}
