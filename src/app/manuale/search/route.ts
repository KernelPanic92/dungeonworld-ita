import { initAdvancedSearch } from "fumadocs-core/search/server";
import type { AdvancedIndex } from "fumadocs-core/search/server";
import { structure } from "fumadocs-core/mdx-plugins";
import { getManualPages, getManualVersions } from "@/lib/keystatic";
import { getManualNavPages } from "@/lib/source";

// cached forever: content is static per deployment
export const revalidate = false;

/**
 * Search covers every version's nav-referenced pages in a single endpoint,
 * derived from the flattened nav lists (orphan drafts are excluded).
 */
async function buildIndexes(): Promise<AdvancedIndex[]> {
  const versions = await getManualVersions();
  const indexes = await Promise.all(
    versions.map(async (version) => {
      const [navPages, pages] = await Promise.all([
        getManualNavPages(version.slug),
        getManualPages(version.slug),
      ]);
      const contentBySlug = new Map(pages.map((p) => [p.entrySlug, p]));

      return navPages.map((p) => ({
        id: p.entrySlug,
        title: p.title,
        url: p.url,
        breadcrumbs: p.group
          ? ["Manuale", version.name, p.group]
          : ["Manuale", version.name],
        structuredData: structure(contentBySlug.get(p.entrySlug)?.content ?? ""),
      }));
    }),
  );
  return indexes.flat();
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("query");
  if (!query) return Response.json([]);

  const search = initAdvancedSearch({ indexes: buildIndexes });
  return Response.json(await search.search(query));
}
