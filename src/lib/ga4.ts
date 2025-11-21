// src/lib/ga4.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "";

// gtag이 아직 로드되지 않았거나 GA ID가 없는 경우를 대비한 가드
function isGAAvailable() {
  if (!GA_TRACKING_ID) return false;
  if (typeof window === "undefined") return false;
  // @ts-ignore
  if (!window.gtag) return false;
  return true;
}

// 페이지 뷰 전송
export const pageview = (url: string) => {
  if (!isGAAvailable()) return;
  // @ts-ignore
  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

// 커스텀 이벤트 전송
export const event = (
  action: string,
  params: {
    [key: string]: any;
  } = {}
) => {
  if (!isGAAvailable()) return;
  // @ts-ignore
  window.gtag("event", action, params);
};

