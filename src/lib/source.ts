import { dynamicLoader, llms } from "fumadocs-core/source";
import type * as PageTree from "fumadocs-core/page-tree";
import { structure } from "fumadocs-core/mdx-plugins";
import {
  getDefaultManualVersion,
  getManualNav,
  getManualPages,
  isValidManualVersion,
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

/** Public URL prefix of a version's manual. The default version is versionless. */
export function manualBaseUrl(version: string, defaultVersion: string) {
  return version === defaultVersion ? `/manuale` : `/${version}/manuale`;
}

/**
 * Fumadocs source for a manual version, backed by Keystatic content.
 * One loader instance per version, cached for the lifetime of the process.
 */
const loaders = new Map<string, Awaited<ReturnType<typeof createManualLoader>>>();

async function createManualLoader(version: string) {
  const defaultVersion = await getDefaultManualVersion();

  return dynamicLoader(
    {
      // paths are relative to the virtual root of this source; slugs derive
      // from them (index.mdoc is stripped), so keep them version-free and
      // let baseUrl carry the /<version>/manuale prefix.
      async files() {
        const pages = await getManualPages(version);

        const pageFiles = pages.map((page) => ({
          type: "page" as const,
          path: [...page.slugs, "index.mdoc"].join("/"),
          data: {
            title: page.title,
            description: page.description,
            structuredData: () => structure(page.content),
          },
        }));

        return pageFiles;
      },
    },
    {
      baseUrl: manualBaseUrl(version, defaultVersion),
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

// ---------------------------------------------------------------------------
// Page tree (sidebar / active item / breadcrumb) — derived from navGroups
// ---------------------------------------------------------------------------
export interface ManualNavPage {
  /** Keystatic entry slug, e.g. `1.0/game-master/gm` */
  entrySlug: string;
  title: string;
  url: string;
  group: string;
}

/**
 * The ordered list of pages referenced by the version's navGroups, with
 * titles and public URLs. Single source for URL derivation: sidebar tree,
 * prev/next, search index and orphan detection all consume this.
 */
export async function getManualNavPages(version: string): Promise<ManualNavPage[]> {
  const [defaultVersion, nav, pages] = await Promise.all([
    getDefaultManualVersion(),
    getManualNav(version),
    getManualPages(version),
  ]);
  const baseUrl = manualBaseUrl(version, defaultVersion);
  const pageBySlug = new Map(pages.map((p) => [p.entrySlug, p]));

  return nav.flatMap((entry) => {
    if (entry.kind !== "page") return [];
    const page = pageBySlug.get(entry.slug);
    if (!page) return [];
    const rest = entry.slug.slice(version.length + 1);
    const url = rest === "index" ? baseUrl : `${baseUrl}/${rest}`;
    return [{ entrySlug: entry.slug, title: page.title, url, group: entry.group }];
  });
}

/** Urls of external (non-page) nav entries, keyed by their label. */
async function getManualNavExternalUrls(version: string) {
  const nav = await getManualNav(version);
  return nav
    .filter((e): e is Extract<typeof e, { kind: "url" }> => e.kind === "url")
    .map((e) => ({ name: e.label, url: e.url, group: e.group }));
}

/**
 * Builds the Fumadocs page tree from the version's navGroups. Pages not in
 * navGroups (orphans) are absent from the tree: no sidebar entry, no
 * breadcrumb, no highlight.
 */
export async function getManualPageTree(version: string): Promise<PageTree.Root> {
  const [navPages, externalUrls] = await Promise.all([
    getManualNavPages(version),
    getManualNavExternalUrls(version),
  ]);

  type Entry = { node: PageTree.Item; group: string };
  const entries: Entry[] = [
    ...navPages.map((p) => ({
      group: p.group,
      node: { type: "page" as const, name: p.title, url: p.url },
    })),
    ...externalUrls.map((u) => ({
      group: u.group,
      node: { type: "page" as const, name: u.name, url: u.url, external: true },
    })),
  ];

  const groups = new Map<string, PageTree.Item[]>();
  const rootChildren: PageTree.Item[] = [];

  for (const { group, node } of entries) {
    if (group === "") {
      rootChildren.push(node);
    } else {
      const items = groups.get(group);
      if (items) items.push(node);
      else groups.set(group, [node]);
    }
  }

  return {
    type: "root",
    name: "Manuale",
    children: [
      ...rootChildren,
      ...[...groups.entries()].map(([name, children]) => ({
        type: "folder" as const,
        name,
        children,
      })),
    ],
  };
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
