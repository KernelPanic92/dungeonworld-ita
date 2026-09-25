import { createReader } from "@keystatic/core/reader";
import { createGitHubReader } from "@keystatic/core/reader/github";
import { readFile } from "node:fs/promises";
import path from "node:path";
import config from "../../keystatic.config";

const REPO = "KernelPanic92/dungeonworld-ita";

type LocalReader = ReturnType<
  typeof createReader<typeof config["collections"], typeof config["singletons"]>
>;
type DraftReader = ReturnType<
  typeof createGitHubReader<typeof config["collections"], typeof config["singletons"]>
>;

let localReader: LocalReader | null = null;
const draftReaders = new Map<string, DraftReader>();

/** True while Next.js draft mode is on (real-time previews). */
async function isDraftMode(): Promise<boolean> {
  try {
    const { draftMode } = await import("next/headers");
    return (await draftMode()).isEnabled;
  } catch {
    // draftMode() throws outside a request (e.g. static generation, scripts)
    return false;
  }
}

/**
 * Draft-mode-aware reader: when draft mode is enabled it reads from the
 * GitHub branch stored in the `ks-branch` cookie (Keystatic previews);
 * otherwise it reads the local repo content.
 */
async function getReader() {
  if (await isDraftMode()) {
    const { cookies } = await import("next/headers");
    const c = await cookies();
    const branch = c.get("ks-branch")?.value;
    if (branch) {
      let reader = draftReaders.get(branch);
      if (!reader) {
        reader = createGitHubReader(config, {
          repo: REPO,
          ref: branch,
          token: c.get("keystatic-gh-access-token")?.value,
        });
        draftReaders.set(branch, reader);
      }
      return reader;
    }
  }
  localReader ??= createReader(".", config);
  return localReader;
}

/**
 * All content is static at runtime (repo-based Keystatic storage),
 * so we memoise reads for the lifetime of the process — except in draft
 * mode, where previews must reflect the saved changes immediately.
 */
const memo = new Map<string, unknown>();
async function memoized<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (await isDraftMode()) return fn();
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

/**
 * Reads a MarkDoc file body, honouring draft mode: when a preview is active
 * the raw file is fetched from the GitHub branch (the local disk only has
 * the committed content), otherwise it reads the local file.
 */
async function readContentBody(relPath: string): Promise<string> {
  if (await isDraftMode()) {
    const { cookies } = await import("next/headers");
    const branch = (await cookies()).get("ks-branch")?.value;
    if (branch) {
      try {
        const res = await fetch(
          `https://raw.githubusercontent.com/${REPO}/${encodeURIComponent(branch)}/${relPath}`,
        );
        if (res.ok) {
          const raw = await res.text();
          const m = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/);
          return (m ? m[1] : raw).trim();
        }
      } catch {
        // fall through to the local file
      }
    }
  }
  return readMdocBody(relPath);
}

// ---------------------------------------------------------------------------
// Manual versions
// ---------------------------------------------------------------------------
export interface ExternalIdentifier {
  platform: string;
  externalId: string;
  url: string | null;
}

export interface ManualVersion {
  slug: string;
  name: string;
  description: string;
  isDefault: boolean;
  /** Slug of the previous edition (only set on subsequent versions, e.g. the beta). */
  predecessor: string | null;
  /** schema.org release status (e.g. "Published", "Draft"). */
  creativeWorkStatus: string;
  /** URL of the version's site page (optional). */
  url: string | null;
  /** External references (Wikipedia, Wikidata, RPGGeek, ...). */
  externalIdentifiers: ExternalIdentifier[];
}

export function getManualVersions(): Promise<ManualVersion[]> {
  return memoized("manualVersions", async () => {
    const entries = await (await getReader()).collections.manualVersions.all();
    return entries
      .map((e) => ({
        slug: e.slug,
        name: e.entry.name,
        description: e.entry.description ?? "",
        isDefault: e.entry.isDefault,
        predecessor: e.entry.predecessor ?? null,
        creativeWorkStatus: e.entry.creativeWorkStatus ?? "Published",
        url: e.entry.url ?? null,
        externalIdentifiers: (e.entry.externalIdentifiers ?? []).map((i) => ({
          platform: i.platform ?? "",
          externalId: i.externalId ?? "",
          url: i.url ?? null,
        })),
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
// SEO / LLM metadata (shared by manual pages and materials)
// ---------------------------------------------------------------------------
export interface SeoData {
  title: string;
  description: string;
  image: string | null;
  noIndex: boolean;
}

export interface LlmData {
  description: string;
  notes: string[];
  exclude: boolean;
}

function readSeo(value: unknown): SeoData {
  const v = (value ?? {}) as {
    title?: string | null;
    description?: string | null;
    image?: string | null;
    noIndex?: boolean | null;
  };
  return {
    title: v.title ?? "",
    description: v.description ?? "",
    image: v.image ?? null,
    noIndex: v.noIndex ?? false,
  };
}

function readLlm(value: unknown): LlmData {
  const v = (value ?? {}) as {
    description?: string | null;
    notes?: string[] | null;
    exclude?: boolean | null;
  };
  return {
    description: v.description ?? "",
    notes: v.notes ?? [],
    exclude: v.exclude ?? false,
  };
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
  summary: string;
  /**
   * Cover image, as a path relative to the entry directory (keystatic
   * `fields.image`); resolve against `/files/manuale/pagine/<entrySlug>/`.
   */
  image: string | null;
  /** Raw MarkDoc content */
  content: string;
  /** Licenses referenced by the page (stored but not rendered yet) */
  licenses: MaterialLicense[];
  seo: SeoData;
  llm: LlmData;
}

export function getManualPages(version: string): Promise<ManualPage[]> {
  return memoized(`manual:${version}`, async () => {
    const [entries, licenses] = await Promise.all([
      (await getReader()).collections.manualPages.all(),
      getLicenses(),
    ]);
    const licenseBySlug = new Map(licenses.map((l) => [l.slug, l]));
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
            summary: e.entry.summary ?? "",
            image: e.entry.image ?? null,
            content: await readContentBody(`docs/manuale/pagine/${e.slug}/index.mdoc`),
            licenses: (e.entry.licenses ?? []).map((l) => {
              const license = l.license ? licenseBySlug.get(l.license) : undefined;
              return {
                licenseSlug: l.license ?? "",
                licenseName: license?.name ?? l.license ?? "",
                licenseUrl: license?.url ?? null,
                scope: l.scope,
              };
            }),
            seo: readSeo(e.entry.seo),
            llm: readLlm(e.entry.llm),
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
// Licenses
// ---------------------------------------------------------------------------
export interface License {
  slug: string;
  name: string;
  label: string;
  url: string | null;
}

export function getLicenses(): Promise<License[]> {
  return memoized("licenses", async () => {
    const entries = await (await getReader()).collections.licenses.all();
    return entries.map((e) => ({
      slug: e.slug,
      name: e.entry.name,
      label: e.entry.label ?? e.entry.name,
      url: e.entry.url ?? null,
    }));
  });
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
  /** Whether the author can appear among the materials filter options. */
  authorFiltrable: boolean;
  kind: string;
  url: string | null;
}

export interface MaterialLicense {
  licenseSlug: string;
  licenseName: string;
  licenseUrl: string | null;
  scope: string;
}

export interface ContainedMaterial {
  /** Entry slug (version-prefixed) */
  entrySlug: string;
  /** Version-free slug, for building the detail URL */
  slug: string;
  name: string;
}

export interface Material {
  slug: string;
  /** Slugs relative to the materials root (e.g. ['barbaro']) */
  slugs: string[];
  name: string;
  version: string;
  type: string;
  source: string;
  summary: string;
  flavor: string;
  /** Public URL of the 1:1 card thumbnail (from the `thumbnail` field) */
  thumbnail: string | null;
  /** The collection this material belongs to, resolved from the collection
   *  materials' `contains` lists (single source of truth). */
  collection: { slug: string; name: string } | null;
  date: string | null;
  licenses: MaterialLicense[];
  /** Materials contained by this material (only for type "collection") */
  contains: ContainedMaterial[];
  showcase: { image: string | null; heroName: string | null } | null;
  credits: MaterialCredit[];
  assets: MaterialAsset[];
  content: string;
  seo: SeoData;
  llm: LlmData;
}

export function getMaterials(version: string): Promise<Material[]> {
  return memoized(`materials:${version}`, async () => {
    const r = await getReader();
    const [entries, authors, licenses] = await Promise.all([
      r.collections.materials.all(),
      r.collections.authors.all(),
      getLicenses(),
    ]);
    const authorInfo = new Map(
      authors.map((a) => [
        a.slug,
        { name: a.entry.completeName, filtrable: a.entry.filtrable !== false },
      ]),
    );
    const licenseBySlug = new Map(licenses.map((l) => [l.slug, l]));
    const versionEntries = entries.filter((e) => e.slug.startsWith(`${version}/`));
    const nameByEntry = new Map(
      versionEntries.map((e) => [
        e.slug,
        (e.entry as unknown as { name: string }).name,
      ]),
    );

    const restOf = (entrySlug: string) => entrySlug.slice(version.length + 1);

    // Reverse lookup: which collection material contains each material.
    // Membership is single-source on the collection (its `contains` field).
    const collectionByMaterial = new Map<string, { slug: string; name: string }>();
    for (const e of versionEntries) {
      const entry = e.entry as unknown as { type?: string; contains?: string[] };
      if (entry.type === "collection" && Array.isArray(entry.contains)) {
        for (const member of entry.contains) {
          if (!collectionByMaterial.has(member)) {
            collectionByMaterial.set(member, {
              slug: restOf(e.slug),
              name: nameByEntry.get(e.slug) ?? e.slug,
            });
          }
        }
      }
    }

    return Promise.all(
      versionEntries.map(async (e) => {
        const rest = restOf(e.slug);
        const entry = e.entry as unknown as {
          name: string;
          version: string;
          type: string;
          source: string;
          summary: string;
          flavor: string;
          date: string | null;
          thumbnail: string | null;
          licenses: Array<{ license: string; scope: string }> | null;
          contains: string[] | null;
          seo?: unknown;
          llm?: unknown;
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
          summary: entry.summary ?? "",
          flavor: entry.flavor ?? "",
          thumbnail: entry.thumbnail ?? null,
          collection: collectionByMaterial.get(e.slug) ?? null,
          date: entry.date,
          licenses: (entry.licenses ?? []).map((l) => {
            const license = l.license ? licenseBySlug.get(l.license) : undefined;
            return {
              licenseSlug: l.license ?? "",
              licenseName: license?.name ?? l.license ?? "",
              licenseUrl: license?.url ?? null,
              scope: l.scope,
            };
          }),
          contains: (entry.contains ?? []).map((member) => ({
            entrySlug: member,
            slug: restOf(member),
            name: nameByEntry.get(member) ?? member,
          })),
          showcase: entry.showcase?.image || entry.showcase?.heroName ? entry.showcase : null,
          credits: (entry.credits ?? []).map((c) => {
            const info = authorInfo.get(c.value.author ?? "");
            return {
              authorSlug: c.value.author ?? "",
              authorName: info?.name ?? c.value.author ?? "",
              authorFiltrable: info?.filtrable ?? true,
              kind: c.value.kind,
              url: c.value.url,
            };
          }),
          assets: (entry.assets ?? []).map((a) => ({
            type: a.discriminant,
            name: a.value.name,
            file: a.value.file ?? null,
            url: a.value.url ?? null,
            thumbnail: a.value.thumbnail ?? null,
          })),
          content: await readContentBody(`docs/materiali/${e.slug}/index.mdoc`),
          seo: readSeo(entry.seo),
          llm: readLlm(entry.llm),
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
    const entries = await (await getReader()).collections.authors.all();
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
    const s = await (await getReader()).singletons.siteSettings.read();
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
    const versions = await (await getReader()).collections.manualVersions.all();
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
