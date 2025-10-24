/**
 * Lightsail S3 presigned URL을 가져오는 클라이언트 헬퍼
 * /api/storage/read?key=... 호출
 */
export async function fetchPresignedUrl(key: string): Promise<string> {
  // ✅ 이미 완전한 URL이면 그대로 사용 (S3 또는 외부 리소스)
  if (/^https?:\/\//i.test(key)) {
    return key;
  }

  // ✅ 로컬 public 경로(/로 시작)도 바로 반환
  if (key.startsWith("/")) {
    return key;
  }

  // ✅ 나머지만 presigned 요청 수행
  const base =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_API_ROUTE
      : window.location.origin;

  const url = `${base}/api/storage/read?key=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch presigned URL: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data?.url) {
      throw new Error("Presigned URL not found in response");
    }

    return data.url;
  } catch (err) {
    console.error("[fetchPresignedUrl] Error:", err);
    throw err;
  }
}




/**
 * getImageUrl()
 * - Converts stored S3 URLs or keys into the storage proxy URL.
 * - Leaves local public assets (paths starting with "/") untouched.
 * - When `absolute` option is true, prepends the provided base URL (or NEXT_PUBLIC_SITE_URL).
 */
export function getImageUrl(
  input: string,
  options?: { absolute?: boolean; baseUrl?: string }
): string {
  if (!input) return "";

  if (input.startsWith("/")) {
    return input;
  }

  if (input.startsWith("data:")) {
    return input;
  }

  if (input.startsWith("blob:")) {
    return input;
  }

  let key = input;

  try {
    if (input.startsWith("http")) {
      const u = new URL(input);
      key = u.pathname.startsWith("/") ? u.pathname.slice(1) : u.pathname;
    }
  } catch {
    // ignore parse errors
  }

  if (key.startsWith("api/storage/read")) {
    key = `/${key}`;
  }

  if (key.startsWith("/api/storage/read")) {
    return options?.absolute
      ? `${options.baseUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? ""}${key}`
      : key;
  }

  const proxyPath = `/api/storage/read?key=${encodeURIComponent(key)}`;

  if (options?.absolute) {
    const base = options.baseUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
    return `${base}${proxyPath}`;
  }

  return proxyPath;
}
