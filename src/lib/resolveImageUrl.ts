// src/lib/resolveImageUrl.ts
const cache = new Map<string, string>();

function isAbsoluteUrl(s: string) {
  return /^https?:\/\//i.test(s);
}
function isPublicPath(s: string) {
  return s.startsWith("/");
}
function isDataOrBlob(s: string) {
  return /^data:|^blob:/i.test(s);
}
function isAlreadyProxyPath(s: string) {
  return s.startsWith("/api/storage/read");
}

// base64(JSON) 형태로 넘어온 key를 복원해서 { src, type } 같은 구조를 뽑는다.
function tryDecodeProxyPayload(raw: string): { src?: string; [k: string]: any } | null {
  try {
    // raw 자체가 base64인 경우
    const maybeJson = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
    return maybeJson && typeof maybeJson === "object" ? maybeJson : null;
  } catch (_) {
    // raw가 "key=ey..." 쿼리로 들어온 경우? 쿼리스트링에서 key 값만 추출해 본다.
    try {
      const url = new URL(raw, "http://fake.local");
      const k = url.searchParams.get("key");
      if (!k) return null;
      const decoded = JSON.parse(Buffer.from(k, "base64").toString("utf8"));
      return decoded && typeof decoded === "object" ? decoded : null;
    } catch {
      return null;
    }
  }
}

export async function resolveImageUrl(raw: string): Promise<string> {
  if (!raw) return "";

  // 1) 즉시 통과 케이스
  if (isAbsoluteUrl(raw) || isPublicPath(raw) || isDataOrBlob(raw) || isAlreadyProxyPath(raw)) {
    return raw;
  }

  // 2) base64(JSON) 프록시 페이로드 감지 → src가 절대 URL이면 그걸 반환
  const decoded = tryDecodeProxyPayload(raw);
  if (decoded?.src && isAbsoluteUrl(decoded.src)) {
    return decoded.src;
  }

  // 3) 캐시
  if (cache.has(raw)) return cache.get(raw)!;

  // 4) 진짜 S3 key로 판단 → presigned 요청
  const base =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_API_ROUTE
      : window.location.origin;

  const api = `${base}/api/storage/read?key=${encodeURIComponent(raw)}`;

  const res = await fetch(api, { cache: "no-store", redirect: "follow" });
  if (!res.ok) throw new Error(`resolveImageUrl: ${res.status} ${res.statusText}`);

  const data = await res.json();
  if (!data?.url) throw new Error("resolveImageUrl: no presigned url");

  cache.set(raw, data.url);
  return data.url;
}
