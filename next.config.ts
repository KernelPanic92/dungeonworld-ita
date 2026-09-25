import type { NextConfig } from "next";

// Default manual version: served without the version segment in the URL.
// Kept in sync with docs/manuale/versioni/1.0 (isDefault: true).
const DEFAULT_MANUAL_VERSION = "1.0";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/manuale",
        destination: `/${DEFAULT_MANUAL_VERSION}/manuale`,
      },
      {
        source: "/manuale/:path*",
        destination: `/${DEFAULT_MANUAL_VERSION}/manuale/:path*`,
      },
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
        destination: `/${DEFAULT_MANUAL_VERSION}/llms.mdx/manuali/:path*`,
      },
    ];
  },
};

export default nextConfig;
