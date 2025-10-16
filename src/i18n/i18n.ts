import { cookies, headers } from "next/headers";

export type Lang = "ko" | "en";

export function getLangFromCookies(): Lang {
  const c = cookies().get("lang")?.value as Lang | undefined;
  if (c === "ko" || c === "en") return c;

  // 쿠키 없을 때 헤더로 폴백 (서버 컴포넌트에서도 사용 가능)
  const al = headers().get("accept-language")?.toLowerCase() || "";
  return al.startsWith("ko") ? "ko" : "en";
}

// 아주 간단한 번역 헬퍼 (소규모 문구용)
export function t(lang: Lang, ko: string, en: string) {
  return lang === "ko" ? ko : en;
}

// 규모가 커지면 딕셔너리로 관리 (동적 import)
// export async function getDictionary(lang: Lang) {
//   if (lang === "ko") {
//     return (await import("./dictionaries/ko.json")).default;
//   }
//   return (await import("./dictionaries/en.json")).default;
// }
