// lib/http.ts
import { BASE_URL } from "./env";
import { getToken, getRefreshToken, setTokens, clearTokens } from "./token";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `Request failed with status ${status}`);
    this.status = status;
    this.body = body;
  }
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

export function extractFastApiMessage(body: unknown): string | undefined {
  if (typeof body === "object" && body !== null && "detail" in body) {
    const d = (body as { detail: unknown }).detail;
    if (typeof d === "string") return d;

    if (Array.isArray(d) && d.length) {
      const first = d[0] as Record<string, unknown>;
      if (typeof first.msg === "string") return first.msg;
    }
  }
  return undefined;
}

type SendOpts = {
  auth?: boolean;
  headers?: HeadersInit;
  method?: string;
  body?: BodyInit | null;
};

// Minimal shape from /auth/refresh
type RefreshResponse = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
};

// --- Single-flight refresh coordination ---
let refreshPromise: Promise<RefreshResponse> | null = null;

async function callRefreshEndpoint(refreshToken: string): Promise<RefreshResponse> {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const text = await res.text();
  const maybeJson: unknown = text ? safeJson(text) : null;

  if (!res.ok) {
    const msg = extractFastApiMessage(maybeJson) ?? res.statusText;
    throw new ApiError(res.status, maybeJson, msg);
  }

  const data = maybeJson as RefreshResponse;
  if (!data || typeof data.access_token !== "string") {
    throw new ApiError(500, maybeJson, "Invalid refresh response");
  }
  return data;
}

async function getNewTokens(): Promise<RefreshResponse | null> {
  const rt = typeof getRefreshToken === "function" ? getRefreshToken() : null;
  if (!rt) return null;

  if (!refreshPromise) {
    refreshPromise = callRefreshEndpoint(rt).finally(() => {
      // reset after the awaiting caller consumes it
      setTimeout(() => {
        refreshPromise = null;
      }, 0);
    });
  }

  try {
    const tokens = await refreshPromise;
    // If server rotates refresh tokens, store the new one; otherwise keep the old.
    setTokens(tokens.access_token, tokens.refresh_token ?? rt);
    return tokens;
  } catch {
    clearTokens();
    return null;
  }
}

async function send<T = unknown>(path: string, opts: SendOpts = {}): Promise<T> {
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(opts.headers || {}),
  };

  if (opts.auth) {
    const token = getToken();
    if (!token) throw new ApiError(401, null, "Not authenticated");
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  // First attempt
  let res = await fetch(`${BASE_URL}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ?? null,
  });

  // If unauthorized and this request requires auth, try a single refresh + retry
  if (res.status === 401 && opts.auth) {
    const refreshed = await getNewTokens();
    if (refreshed?.access_token) {
      // Retry once with the new access token
      (headers as Record<string, string>).Authorization = `Bearer ${refreshed.access_token}`;
      res = await fetch(`${BASE_URL}${path}`, {
        method: opts.method ?? "GET",
        headers,
        body: opts.body ?? null, // OK for JSON/string/URLSearchParams/FormData
      });
    }
  }

  const text = await res.text();
  const maybeJson: unknown = text ? safeJson(text) : null;

  if (!res.ok) {
    const msg = extractFastApiMessage(maybeJson) ?? res.statusText;
    throw new ApiError(res.status, maybeJson, msg);
  }
  return (maybeJson as T) ?? ({} as T);
}

export function get<T = unknown>(path: string, opts?: { auth?: boolean; headers?: HeadersInit }) {
  return send<T>(path, { method: "GET", ...(opts ?? {}) });
}

export function postFormUrlEncoded<T = unknown>(
  path: string,
  form: Record<string, unknown>,
  opts?: { auth?: boolean; headers?: HeadersInit; method?: "POST" | "PUT" | "PATCH" | "DELETE" }
) {
  const params = new URLSearchParams();
  Object.entries(form).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    params.append(k, String(v));
  });
  return send<T>(path, {
    method: opts?.method ?? "POST",
    auth: opts?.auth,
    headers: { "Content-Type": "application/x-www-form-urlencoded", ...(opts?.headers || {}) },
    body: params,
  });
}

/** For JSON endpoints */
export function sendJson<T = unknown>(
  path: string,
  json: unknown,
  opts?: { auth?: boolean; headers?: HeadersInit; method?: "POST" | "PUT" | "PATCH" | "DELETE" }
) {
  return send<T>(path, {
    method: opts?.method ?? "POST",
    auth: opts?.auth,
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    body: JSON.stringify(json ?? {}),
  });
}

/** For multipart/form-data (pass a ready FormData) */
export function sendFormData<T = unknown>(
  path: string,
  formData: FormData,
  opts?: { auth?: boolean; method?: "POST" | "PUT" | "PATCH" }
) {
  // DO NOT set Content-Type; fetch will set the boundary automatically
  return send<T>(path, {
    method: opts?.method ?? "POST",
    auth: opts?.auth,
    body: formData,
  });
}
