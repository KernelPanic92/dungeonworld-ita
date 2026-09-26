import type { MetadataRoute } from "next";
import ruleSetRepository, {
  manualBaseUrl,
} from "@/lib/content";
import { getSiteBaseUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [versions, defaultVersion] = await Promise.all([
    ruleSetRepository.getVersions(),
    ruleSetRepository.getDefaultVersion(),
  ]);
  const materials = await ruleSetRepository
    .findOne(defaultVersion)
    .then((r) => r?.materials ?? []);
  const BASE_URL = getSiteBaseUrl();

  // Every version with nav pages. Orphans (not in navGroups) and pages marked
  // noindex are excluded: they carry a robots noindex meta.
  const manualEntries = await Promise.all(
    versions.map(async (version) => {
      const [navPages, pages] = await Promise.all([
        ruleSetRepository.getNavPages(version.slug),
        ruleSetRepository.findOne(version.slug).then((r) => r?.pages ?? []),
      ]);
      if (navPages.length === 0) return [];

      const noIndexSlugs = new Set(
        pages.filter((p) => p.seo.noIndex).map((p) => p.entrySlug),
      );
      const indexed = navPages.filter((p) => !noIndexSlugs.has(p.entrySlug));
      if (indexed.length === 0) return [];

      const isDefault = version.slug === defaultVersion;
      const priority = isDefault ? 0.7 : 0.5;
      const baseUrl = manualBaseUrl(version.slug, defaultVersion);

      return [
        {
          url: `${BASE_URL}${baseUrl}`,
          changeFrequency: "yearly" as const,
          priority: isDefault ? 0.9 : 0.5,
        },
        ...indexed
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
    {
      url: `${BASE_URL}/cookie-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...manualEntries.flat(),
    // material detail pages (default version), noindex ones excluded
    ...materials
      .filter((material) => !material.seo.noIndex)
      .map((material) => ({
        url: `${BASE_URL}/materiali/${material.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
  ];
}