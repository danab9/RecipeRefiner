import { afterEach, describe, expect, it, vi } from "vitest";
import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios";

// `api` reads its env at module load, so each case stubs the env, resets the
// module cache, and imports a fresh instance.
async function loadApi(sendCredentials?: string) {
  if (sendCredentials !== undefined) {
    vi.stubEnv("VITE_SEND_CREDENTIALS", sendCredentials);
  }
  vi.resetModules();
  const { api } = await import("@/lib/axios");
  return api;
}

/** Send one request through `api` and return the config the adapter received. */
async function captureRequest(api: Awaited<ReturnType<typeof loadApi>>) {
  let captured: InternalAxiosRequestConfig | undefined;
  const adapter: AxiosAdapter = async (config) => {
    captured = config;
    return { data: {}, status: 200, statusText: "OK", headers: {}, config };
  };
  await api.post("/", {}, { adapter });
  return captured!;
}

describe("api axios instance", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    document.cookie = "csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  });

  it("sends credentials and the CSRF header by default", async () => {
    document.cookie = "csrftoken=abc123";
    const api = await loadApi();

    const config = await captureRequest(api);

    expect(config.withCredentials).toBe(true);
    expect(config.headers.get("X-CSRFToken")).toBe("abc123");
  });

  it("omits credentials and the CSRF header when VITE_SEND_CREDENTIALS=false", async () => {
    document.cookie = "csrftoken=abc123";
    const api = await loadApi("false");

    const config = await captureRequest(api);

    expect(config.withCredentials).toBe(false);
    expect(config.headers.get("X-CSRFToken")).toBeUndefined();
  });

  it("sends credentials for any value other than 'false'", async () => {
    const api = await loadApi("true");

    const config = await captureRequest(api);

    expect(config.withCredentials).toBe(true);
  });
});
