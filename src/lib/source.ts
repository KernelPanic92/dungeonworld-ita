import { dynamicLoader, llms } from "fumadocs-core/source";
import { structure } from "fumadocs-core/mdx-plugins";
import {
  getDefaultManualVersion,
  getManualFolderMetas,
  getManualPages,
  isValidManualVersion,
  reader,
} from "./keystatic";

export interface ManualPageData {
  title: string;
  description: string;
  /**
   * Structured data for TOC/search, computed from the raw MarkDoc content.
   * MarkDoc is a markdown superset, so headings are extracted as usual.
   */
  structuredData: ReturnType<typeof structure>;
}

/**
 * Fumadocs source for a manual version, backed by Keystatic content.
 * One loader instance per version, cached for the lifetime of the process.
 */
const loaders = new Map<string, Awaited<ReturnType<typeof createManualLoader>>>();

async function createManualLoader(version: string) {
  const defaultVersion = await getDefaultManualVersion();
  // The default manual version is served without the version segment in the
  // URL (rewrites in next.config.ts fill it in), so its pages keep versionless
  // URLs in the page tree as well.
  const baseUrl =
    version === defaultVersion ? `/manuale` : `/${version}/manuale`;

  return dynamicLoader(
    {
      // paths are relative to the virtual root of this source; slugs derive
      // from them (index.mdoc is stripped), so keep them version-free and
      // let baseUrl carry the /<version>/manuale prefix.
      async files() {
        const [pages, metas] = await Promise.all([
          getManualPages(version),
          getManualFolderMetas(version),
        ]);

        const pageFiles = pages.map((page) => ({
          type: "page" as const,
          path: [...page.slugs, "index.mdoc"].join("/"),
          data: {
            title: page.title,
            description: page.description,
            structuredData: () => structure(page.content),
          },
        }));

        const metaFiles = metas.map((meta) => ({
          type: "meta" as const,
          path: meta.path,
          data: {
            title: meta.title,
            pages: meta.pages,
          },
        }));

        return [...pageFiles, ...metaFiles];
      },
    },
    {
      baseUrl,
    },
  );
}

export async function getManualSource(version: string) {
  if (!loaders.has(version)) {
    if (!(await isValidManualVersion(version))) {
      throw new Error(`Unknown manual version: ${version}`);
    }
    const loader = await createManualLoader(version);
    loaders.set(version, loader);
  }
  return loaders.get(version)!;
}

export async function getDefaultManualSource() {
  return getManualSource(await getDefaultManualVersion());
}

// ---------------------------------------------------------------------------
// LLMs helpers
// ---------------------------------------------------------------------------
/**
 * Raw MarkDoc content of a page, lightly cleaned for LLM consumption
 * (custom tags are stripped of their {% %} markers).
 */
export function markdocToLlmText(content: string): string {
  return content
    .replace(/\{%\s*(\/)?(callout|steps)[^%]*%\}/g, (_m, closing: string | undefined) =>
      closing ? "" : "",
    )
    .trim();
}

async function withContentMap<T>(
  version: string,
  fn: (map: Map<string, string>) => T | Promise<T>,
): Promise<T> {
  const pages = await getManualPages(version);
  const map = new Map(pages.map((p) => [p.slugs.join("/"), p.content]));
  return fn(map);
}

export async function getLlms(version: string) {
  const source = await getManualSource(version);
  return withContentMap(version, (contentMap) =>
    llms(() => source.get(), {
      renderPage: async (page: {
        slugs: string[];
        url: string;
        data: { title?: string; description?: string };
      }) => {
        const raw = contentMap.get(page.slugs.join("/")) ?? "";
        const content = markdocToLlmText(raw);
        const title = page.data.title ?? "";
        const parts: string[] = [`# ${title}`];
        if (page.data.description) parts.push(page.data.description);
        // the content usually opens with the same H1: drop it to avoid duplication
        const h1 = new RegExp(`^#\\s+${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n+`);
        parts.push(content.replace(h1, ""));
        return parts.join("\n");
      },
    }),
  );
}
