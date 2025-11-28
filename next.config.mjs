import path from "path";
import { fileURLToPath } from "url";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
//   Supabase 시절 배경)

// 당시 정적 라우트 기반의 페이지가 많았기 때문이에요.
// Supabase + Next.js 조합에서는 보통 “디렉토리 구조 = URL 구조” 식으로 동작해서
// 디렉토리 경로처럼 끝에 / 붙이는 게 자연스러웠어
  trailingSlash: false,
  // Skip static optimization for pages using useSearchParams
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: "beauty-bucket-public.s3.us-west-2.amazonaws.com",
        protocol: "https",
      },
    ],
    domains: ['beauty-bucket-public.s3.us-west-2.amazonaws.com'],

    unoptimized: true,
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
    prependData: `@import "src/styles/_variables.scss"; @import "src/styles/_mixins.scss"; @import "src/styles/animation.scss";`,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/home",
        permanent: true,
      },
      {
        source: "/hospital/:id",
        missing: [
          {
            type: "query",
            key: "tab",
          },
        ],
        destination: "/hospital/:id?tab=info",
        permanent: true,
      },
      {
        source: "/recommend/:id",
        missing: [
          {
            type: "query",
            key: "tab",
          },
        ],
        destination: "/recommend/:id?tab=event",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
