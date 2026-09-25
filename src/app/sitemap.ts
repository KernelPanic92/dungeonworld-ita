import type { MetadataRoute } from "next";
import { getDefaultManualVersion, getManualPages, getMaterials } from "@/lib/keystatic";

const BASE_URL = "https://www.dungeonworld-italia.it";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const defaultVersion = await getDefaultManualVersion();

  const manualPages = await getManualPages(defaultVersion);
  const materials = await getMaterials(defaultVersion);

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/manuale`,
      changeFrequency: "yearly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/materiali`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // manual pages: the default version has versionless URLs
    ...manualPages
      .filter((page) => page.slugs.length > 0)
      .map((page) => ({
        url: `${BASE_URL}/manuale/${page.slugs.join("/")}`,
        changeFrequency: "yearly" as const,
        priority: 0.7,
      })),
    // material detail pages
    ...materials.map((material) => ({
      url: `${BASE_URL}/materiali/${material.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];

  return entries;
}
