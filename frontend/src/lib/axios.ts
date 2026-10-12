import axios from "axios";

/**
 * The single axios instance for the whole app. Every backend call goes through
 * `src/api/*`, which imports this — do not create a second instance or use bare
 * `fetch` for authenticated calls (they would miss credentials/CSRF and 403).
 *
 * - `baseURL`: `VITE_API_URL` in dev (points at the Django server), `/api` in
 *   production where the SPA is served same-origin by Django.
 * - `withCredentials`: the Django session cookie authenticates the user. Off in
 *   the extension build (`--mode extension`): the popup is anonymous by design
 *   and cannot read the site's `csrftoken`, so sending the session cookie of a
 *   user logged into the site would make DRF enforce CSRF and return 403.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: import.meta.env.MODE !== "extension",
});

/** Read a cookie value by name from `document.cookie`. */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// CSRF: Django sets the `csrftoken` cookie when the SPA is first served
// (`ensure_csrf_cookie`). Echo it back as `X-CSRFToken` on every request so
// unsafe methods (POST/DELETE) pass Django's CSRF check.
api.interceptors.request.use((config) => {
  const token = getCookie("csrftoken");
  if (token) {
    config.headers.set("X-CSRFToken", token);
  }
  return config;
});

export default api;
