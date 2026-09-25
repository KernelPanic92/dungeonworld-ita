import { notFound } from "next/navigation";
import {
  getDefaultManualVersion,
  getManualVersions,
} from "@/lib/keystatic";
import { getSiteLlms, getSiteLlmSource } from "@/lib/llms";

// cached forever: content is static per deployment
export const revalidate = false;

interface Params {
  params: Promise<{ slug?: string[] }>;
}

/**
 * Per-page LLM content for every area of the site:
 * - `/llms.mdx/manuale/<rest>` (default version) and `/llms.mdx/manuale/<version>/<rest>`
 * - `/llms.mdx/materiali/<slug>` (default version) and `/llms.mdx/<version>/materiali/<slug>`
 * - `/llms.mdx/progetto` and `/llms.mdx/` (home)
 * Legacy URLs keep working: `/llms.mdx/<version>/<rest>` (manual page) and the
 * `manuali` alias (rewritten by next.config to the default version).
 */
export async function GET(_request: Request, { params }: Params) {
  const segments = (await params).slug ?? [];
  const loader = await getSiteLlmSource();
  const generator = await getSiteLlms();

  const slugs = await resolveSlugs(segments);
  if (!slugs) notFound();

  const page = loader.getPage(slugs);
  if (!page) notFound();

  return new Response(await generator.page(page), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

async function resolveSlugs(
  segments: string[],
): Promise<string[] | undefined> {
  const [defaultVersion, versions] = await Promise.all([
    getDefaultManualVersion(),
    getManualVersions(),
  ]);
  const versionSlugs = new Set(versions.map((v) => v.slug));
  const [first, ...rest] = segments;

  if (segments.length === 0) return [];

  if (first === "progetto") return ["progetto"];
  if (first === "manuali") return ["manuale", defaultVersion, ...rest];

  if (first === "materiali") {
    // /llms.mdx/materiali/<slug> → default version
    return ["materiali", defaultVersion, ...rest];
  }

  if (first === "manuale") {
    // /llms.mdx/manuale/<version>/<rest> or /llms.mdx/manuale/<rest> (default)
    if (rest.length > 0 && versionSlugs.has(rest[0])) {
      return ["manuale", rest[0], ...rest.slice(1)];
    }
    return ["manuale", defaultVersion, ...rest];
  }

  // legacy: /llms.mdx/<version>/<rest> (manual) or /llms.mdx/<version>/materiali/<slug>
  if (versionSlugs.has(first)) {
    if (rest[0] === "materiali") {
      return ["materiali", first, ...rest.slice(1)];
    }
    return ["manuale", first, ...rest];
  }

  // legacy without version: default version manual page
  return ["manuale", defaultVersion, ...segments];
}