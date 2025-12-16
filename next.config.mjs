import path from "path";
import { fileURLToPath } from "url";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Admin 페이지 보안 헤더
const adminSecurityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'no-referrer',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'off',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

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
    // CSP 설정 - Stream Chat 포함
    const cspHeader = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com https://maps.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' blob: data: https: http:",
      "font-src 'self' https://fonts.gstatic.com data:",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://maps.googleapis.com https://*.googleapis.com https://beauty-bucket-public.s3.us-west-2.amazonaws.com https://chat.stream-io-api.com https://api.stream-io-api.com https://getstream.io wss://chat.stream-io-api.com wss://api.stream-io-api.com ws: wss:",
      "frame-src 'self' https://www.google.com https://maps.google.com https://*.daily.co",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    return [
      {
        // 모든 페이지에 CSP 헤더 적용
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
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
      {
        // Admin 페이지 보안 헤더
        source: '/admin/:path*',
        headers: adminSecurityHeaders,
      },
      {
        // Admin API 보안 헤더
        source: '/api/admin/:path*',
        headers: adminSecurityHeaders,
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
      // {
      //   source: "/hospital/:id",
      //   missing: [
      //     {
      //       type: "query",
      //       key: "tab",
      //     },
      //   ],
      //   destination: "/hospital/:id?tab=info",
      //   permanent: true,
      // },
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
