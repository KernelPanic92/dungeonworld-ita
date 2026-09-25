import type { MetadataRoute } from "next";
import {
  getDefaultManualVersion,
  getManualVersions,
  getMaterials,
} from "@/lib/keystatic";
import { getManualNavPages } from "@/lib/source";

const BASE_URL = "https://www.dungeonworld-italia.it";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [versions, defaultVersion] = await Promise.all([
    getManualVersions(),
    getDefaultManualVersion(),
  ]);
  const materials = await getMaterials(defaultVersion);

  // Every version with nav pages, orphans excluded (they are noindex).
  const manualEntries = await Promise.all(
    versions.map(async (version) => {
      const navPages = await getManualNavPages(version.slug);
      if (navPages.length === 0) return [];

      const isDefault = version.slug === defaultVersion;
      const priority = isDefault ? 0.7 : 0.5;
      const baseUrl = `/manuale/${version.slug}`;

      return [
        {
          url: `${BASE_URL}${baseUrl}`,
          changeFrequency: "yearly" as const,
          priority: isDefault ? 0.9 : 0.5,
        },
        ...navPages
          .filter((p) => p.url !== baseUrl)
          .map((p) => ({
            url: `${BASE_URL}${p.url}`,
            changeFrequency: "yearly" as const,
            priority,
          })),
      ];
    }),
  );

  return [
    {
      url: `${BASE_URL}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/materiali`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...manualEntries.flat(),
    // material detail pages (default version)
    ...materials.map((material) => ({
      url: `${BASE_URL}/materiali/${material.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
