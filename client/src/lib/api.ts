const DEFAULT_HEADERS: HeadersInit = {
  "Content-Type": "application/json",
};

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(path, {
    credentials: "include",
    headers: DEFAULT_HEADERS,
    ...options,
  });
}

export async function apiFetchJson<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await apiFetch(path, options);

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error((body as { error: string }).error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}
