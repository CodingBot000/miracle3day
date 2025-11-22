"use client";

import Script from "next/script";
import { GA_TRACKING_ID } from "@/lib/ga4";

export default function GA4Scripts() {
  if (!GA_TRACKING_ID) {
    // GA ID가 없으면 스크립트 자체를 렌더링하지 않음
    return null;
  }

  return (
    <>
      {/* GA4 기본 gtag.js 로드 */}
      <Script
        id="ga4-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />

      {/* GA4 초기화 스크립트 */}
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              send_page_view: false
            });
          `,
        }}
      />
    </>
  );
}

