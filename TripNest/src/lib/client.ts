export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; details?: Record<string, string> };

export async function apiFetch<T>(
  url: string,
  init?: RequestInit & { json?: unknown },
): Promise<ApiResult<T>> {
  try {
    const { json, ...rest } = init ?? {};
    const res = await fetch(url, {
      ...rest,
      headers: json ? { "Content-Type": "application/json", ...(rest.headers ?? {}) } : rest.headers,
      body: json ? JSON.stringify(json) : rest.body,
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      return {
        ok: false,
        error: typeof data.error === "string" ? data.error : "Request failed.",
        details: (data.details as Record<string, string>) ?? {},
      };
    }
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, error: "Network error — check your connection." };
  }
}
