import type { NextConfig } from "next";

// Default manual version: served without the version segment in the URL.
// Kept in sync with docs/manuale/versioni/1.0 (isDefault: true).
const DEFAULT_MANUAL_VERSION = "1.0";

const nextConfig: NextConfig = {
  // The files route reads docs/ at runtime; keep the 326MB design/ source
  // archive (indd, fonts) out of the serverless bundle: Vercel caps functions
  // at 250MB uncompressed.
  outputFileTracingExcludes: {
    "/files/**": ["design/**/*"],
  },
  async headers() {
    return [
      {
        // Let agents discover /llms.txt even without prior knowledge of the
        // convention (https://llmstxt.org): the `Link` header form of the
        // `describedby` relation works for HTML pages and non-HTML resources.
        source: "/:path*",
        headers: [
          { key: "Link", value: "</llms.txt>; rel=\"describedby\"" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/materiali",
        destination: `/${DEFAULT_MANUAL_VERSION}/materiali`,
      },
      {
        source: "/materiali/:path*",
        destination: `/${DEFAULT_MANUAL_VERSION}/materiali/:path*`,
      },
      {
        source: "/llms.mdx/manuali/:path*",
        destination: `/llms.mdx/${DEFAULT_MANUAL_VERSION}/:path*`,
      },
    ];
  },
};

export default nextConfig;
