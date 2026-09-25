import { notFound } from "next/navigation";
import { initAdvancedSearch } from "fumadocs-core/search/server";
import type { AdvancedIndex } from "fumadocs-core/search/server";
import { structure } from "fumadocs-core/mdx-plugins";
import { isValidManualVersion, getManualPages } from "@/lib/keystatic";
import { getManualNavPages } from "@/lib/source";

// cached forever: content is static per deployment
export const revalidate = false;

interface Params {
  params: Promise<{ "manual-version": string }>;
}

/**
 * Search only covers pages referenced by navGroups, in a single derivation
 * from the flattened list (orphan drafts are excluded).
 */
async function buildIndexes(version: string): Promise<AdvancedIndex[]> {
  const [navPages, pages] = await Promise.all([
    getManualNavPages(version),
    getManualPages(version),
  ]);
  const contentBySlug = new Map(pages.map((p) => [p.entrySlug, p]));

  return navPages.map((p) => {
    const page = contentBySlug.get(p.entrySlug);
    return {
      id: p.entrySlug,
      title: p.title,
      url: p.url,
      breadcrumbs: p.group ? ["Manuale", p.group] : ["Manuale"],
      structuredData: structure(page?.content ?? ""),
    };
  });
}

export async function GET(request: Request, { params }: Params) {
  const { "manual-version": version } = await params;
  if (!(await isValidManualVersion(version))) notFound();

  const query = new URL(request.url).searchParams.get("query");
  if (!query) return Response.json([]);

  const search = initAdvancedSearch({ indexes: () => buildIndexes(version) });
  return Response.json(await search.search(query));
}