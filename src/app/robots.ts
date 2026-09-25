import type { MetadataRoute } from "next";
import { getSiteBaseUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // the Keystatic admin is for editors only
      disallow: ["/keystatic", "/api/keystatic"],
    },
    sitemap: `${getSiteBaseUrl()}/sitemap.xml`,
  };
}
