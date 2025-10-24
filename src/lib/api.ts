export async function apiGet<T = any>(path: string, params?: Record<string, any>) {
  const qs = params
    ? `?${new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString()}`
    : "";
  const res = await fetch(`${path}${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

export async function apiPost<T = any>(path: string, body: any) {
  const res = await fetch(path, { method: "POST", body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

export async function apiPatch<T = any>(path: string, body: any) {
  const res = await fetch(path, { method: "PATCH", body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

export async function apiDelete<T = any>(path: string) {
  const res = await fetch(path, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}
