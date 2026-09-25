import type { MetadataRoute } from "next";

const BASE_URL = "https://www.dungeonworld-italia.it";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // the Keystatic admin is for editors only
      disallow: ["/keystatic", "/api/keystatic"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
