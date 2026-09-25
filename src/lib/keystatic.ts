import { createReader } from "@keystatic/core/reader";
import { readFile } from "node:fs/promises";
import path from "node:path";
import config from "../../keystatic.config";

export const reader = createReader(".", config);

/**
 * All content is static at runtime (repo-based Keystatic storage),
 * so we memoise reads for the lifetime of the process.
 */
const memo = new Map<string, unknown>();
async function memoized<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (!memo.has(key)) {
    memo.set(key, await fn());
  }
  return memo.get(key) as T;
}

// ---------------------------------------------------------------------------
// Raw MarkDoc content (.mdoc files = YAML frontmatter + MarkDoc body)
// ---------------------------------------------------------------------------
export async function readMdocBody(relPath: string): Promise<string> {
  try {
    const raw = await readFile(path.join(process.cwd(), relPath), "utf8");
    const m = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/);
    return (m ? m[1] : raw).trim();
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// Manual versions
// ---------------------------------------------------------------------------
export interface ManualVersion {
  slug: string;
  name: string;
  description: string;
  isDefault: boolean;
}

export function getManualVersions(): Promise<ManualVersion[]> {
  return memoized("manualVersions", async () => {
    const entries = await reader.collections.manualVersions.all();
    return entries
      .map((e) => ({
        slug: e.slug,
        name: e.entry.name,
        description: e.entry.description ?? "",
        isDefault: e.entry.isDefault,
      }))
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.slug.localeCompare(b.slug));
  });
}

export async function getDefaultManualVersion(): Promise<string> {
  const versions = await getManualVersions();
  return versions.find((v) => v.isDefault)?.slug ?? versions[0]?.slug ?? "1.0";
}

export async function isValidManualVersion(version: string): Promise<boolean> {
  const versions = await getManualVersions();
  return versions.some((v) => v.slug === version);
}

/**
 * The version a manual URL belongs to. The default version is versionless:
 * a leading segment that matches a version is the version, anything else
 * (or nothing) resolves to the default version.
 */
export async function resolveManualVersion(slug?: string[]): Promise<string> {
  const segments = slug ?? [];
  const defaultVersion = await getDefaultManualVersion();
  if (segments.length === 0) return defaultVersion;
  const [first] = segments;
  if (first === defaultVersion) return defaultVersion;
  if (await isValidManualVersion(first)) return first;
  return defaultVersion;
}

// ---------------------------------------------------------------------------
// Manual pages (per version)
// ---------------------------------------------------------------------------
export interface ManualPage {
  /** Slugs relative to the manual root (e.g. [] for the index page, ['game-master', 'gm']) */
  slugs: string[];
  /** Keystatic entry slug, e.g. `1.0/game-master/gm` */
  entrySlug: string;
  title: string;
  description: string;
  /** Raw MarkDoc content */
  content: string;
}

export function getManualPages(version: string): Promise<ManualPage[]> {
  return memoized(`manual:${version}`, async () => {
    const entries = await reader.collections.manualPages.all();
    return Promise.all(
      entries
        .filter((e) => e.slug.startsWith(`${version}/`))
        .map(async (e) => {
          const rest = e.slug.slice(version.length + 1); // e.g. 'index' | 'game-master/gm'
          const slugs = rest === "index" ? [] : rest.split("/");
          return {
            slugs,
            entrySlug: e.slug,
            title: e.entry.title,
            description: e.entry.description ?? "",
            content: await readMdocBody(`docs/manuale/pagine/${e.slug}/index.mdoc`),
          };
        }),
    );
  });
}

export async function getManualPage(
  version: string,
  slugs: string[],
): Promise<ManualPage | undefined> {
  const pages = await getManualPages(version);
  const key = slugs.join("/");
  return pages.find((p) => (slugs.length === 0 ? p.slugs.length === 0 : p.slugs.join("/") === key));
}

// ---------------------------------------------------------------------------
// Materials (per version)
// ---------------------------------------------------------------------------
export interface MaterialAsset {
  type: "file" | "external";
  name: string;
  /** File name inside the entry dir (file assets) */
  file: string | null;
  /** External URL (external assets) */
  url: string | null;
  thumbnail: string | null;
}

export interface MaterialCredit {
  authorSlug: string;
  authorName: string;
  kind: string;
  url: string | null;
}

export interface Material {
  slug: string;
  /** Slugs relative to the materials root (e.g. ['barbaro']) */
  slugs: string[];
  name: string;
  version: string;
  type: string;
  source: string;
  shortDescription: string;
  description: string;
  collection: string;
  date: string | null;
  license: { name: string; url: string } | null;
  showcase: { image: string | null; heroName: string | null } | null;
  credits: MaterialCredit[];
  assets: MaterialAsset[];
  content: string;
}

export function getMaterials(version: string): Promise<Material[]> {
  return memoized(`materials:${version}`, async () => {
    const [entries, authors] = await Promise.all([
      reader.collections.materials.all(),
      reader.collections.authors.all(),
    ]);
    const authorNames = new Map(authors.map((a) => [a.slug, a.entry.completeName]));

    return Promise.all(
      entries
        .filter((e) => e.slug.startsWith(`${version}/`))
        .map(async (e) => {
        const rest = e.slug.slice(version.length + 1);
        const entry = e.entry as unknown as {
          name: string;
          version: string;
          type: string;
          source: string;
          shortDescription: string;
          description: string;
          collection: string;
          date: string | null;
          license: { name: string; url: string } | null;
          showcase: { image: string | null; heroName: string | null } | null;
          credits: Array<{ discriminant: string; value: { author: string | null; kind: string; url: string | null } }>;
          assets: Array<{
            discriminant: "file" | "external";
            value: { name: string; file: string | null; url: string | null; thumbnail: string | null };
          }>;

        };

        return {
          slug: rest,
          slugs: rest.split("/"),
          name: entry.name,
          version: entry.version,
          type: entry.type,
          source: entry.source,
          shortDescription: entry.shortDescription ?? "",
          description: entry.description ?? "",
          collection: entry.collection ?? "",
          date: entry.date,
          license: entry.license?.name ? entry.license : null,
          showcase: entry.showcase?.image || entry.showcase?.heroName ? entry.showcase : null,
          credits: (entry.credits ?? []).map((c) => ({
            authorSlug: c.value.author ?? "",
            authorName: c.value.author ? authorNames.get(c.value.author) ?? c.value.author : "",
            kind: c.value.kind,
            url: c.value.url,
          })),
          assets: (entry.assets ?? []).map((a) => ({
            type: a.discriminant,
            name: a.value.name,
            file: a.value.file ?? null,
            url: a.value.url ?? null,
            thumbnail: a.value.thumbnail ?? null,
          })),
          content: await readMdocBody(`docs/materiali/${e.slug}/index.mdoc`),
        };
        }),
    );
  });
}

export async function getMaterial(version: string, slug: string): Promise<Material | undefined> {
  const materials = await getMaterials(version);
  return materials.find((m) => m.slug === slug);
}

// ---------------------------------------------------------------------------
// Authors
// ---------------------------------------------------------------------------
export interface Author {
  slug: string;
  completeName: string;
  avatar: string | null;
  urls: Record<string, string | null>;
}

export function getAuthors(): Promise<Author[]> {
  return memoized("authors", async () => {
    const entries = await reader.collections.authors.all();
    return entries.map((e) => ({
      slug: e.slug,
      completeName: e.entry.completeName,
      avatar: e.entry.avatar ?? null,
      urls: (e.entry.urls ?? {}) as Record<string, string | null>,
    }));
  });
}

// ---------------------------------------------------------------------------
// Site settings
// ---------------------------------------------------------------------------
export interface SiteSettings {
  title: string;
  description: string;
  donateUrl: string | null;
  githubUrl: string | null;
}

export function getSiteSettings(): Promise<SiteSettings | null> {
  return memoized("siteSettings", async () => {
    const s = await reader.singletons.siteSettings.read();
    if (!s) return null;
    return {
      title: s.title ?? "",
      description: s.description ?? "",
      donateUrl: s.donateUrl ?? null,
      githubUrl: s.githubUrl ?? null,
    };
  });
}

// ---------------------------------------------------------------------------
// Manual navigation (single source of truth: the version entry's navGroups)
// ---------------------------------------------------------------------------
export type ManualNavEntry =
  | { kind: "page"; slug: string; group: string }
  | { kind: "url"; label: string; url: string; group: string };

/**
 * Flattens a version entry's navGroups into an ordered list.
 * Everything nav-related (sidebar tree, active item, breadcrumbs,
 * prev/next, search index) derives from this list.
 * External url entries are kept (they show in the sidebar); page-specific
 * consumers filter by `kind === "page"`.
 */
export function getManualNav(version: string): Promise<ManualNavEntry[]> {
  return memoized(`manual-nav:${version}`, async () => {
    const versions = await reader.collections.manualVersions.all();
    const entry = versions.find((v) => v.slug === version);
    const navGroups = entry?.entry.navGroups ?? [];

    const items: ManualNavEntry[] = [];
    for (const group of navGroups) {
      const groupName = group.groupName ?? "";
      for (const item of group.items ?? []) {
        if (item.discriminant === "url") {
          items.push({
            kind: "url",
            label: item.value.label || item.value.url || "",
            url: item.value.url ?? "",
            group: groupName,
          });
        } else if (item.value.page) {
          items.push({ kind: "page", slug: item.value.page, group: groupName });
        }
      }
    }
    return items;
  });
}
