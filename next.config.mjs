import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
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
        hostname: "afsfroagcvtulsttshvc.supabase.co",
        protocol: "https",
      },
      {
        hostname: "tqyarvckzieoraneohvv.supabase.co",
        protocol: "https",
      },
    ],
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

export default nextConfig;
