import Markdoc, { type Node as MarkdocNode } from "@markdoc/markdoc";
import type { Reader } from "./reader-factory";
import type {
  Author,
  License,
  ManualNavGroup,
  ManualNavItemUnion,
  ManualPage,
  ManualVersion,
  Material,
  MaterialAsset,
  MaterialCredit,
  MaterialLicense,
  RuleSet,
  SeoData,
  SiteSettings,
  LlmData,
} from "./models";

/** Public URL prefix of a manual version: the default one is versionless. */
export function manualBaseUrl(version: string, defaultVersion: string) {
  return version === defaultVersion ? `/manuale` : `/manuale/${version}`;
}

/** A page referenced by a version's navGroups, with title and public URL. */
export interface ManualNavPage {
  /** Keystatic entry slug, e.g. `1.0/game-master/gm` */
  entrySlug: string;
  title: string;
  url: string;
  group: string;
}

/**
 * The port consumed by the application: every rule set (manual version)
 * with its pages, materials and license, plus the global settings.
 */
export interface RuleSetRepository {
  /** Every rule set, default version first. */
  findAll(): Promise<RuleSet[]>;
  findOne(version: string): Promise<RuleSet | undefined>;
  findPage(version: string, slugs: string[]): Promise<ManualPage | undefined>;
  findMaterial(version: string, slug: string): Promise<Material | undefined>;
  /** Nav-referenced pages of a version, in navGroups order, with URLs. */
  getNavPages(version: string): Promise<ManualNavPage[]>;
  getVersions(): Promise<ManualVersion[]>;
  getDefaultVersion(): Promise<string>;
  isValidVersion(version: string): Promise<boolean>;
  /**
   * The version a manual URL belongs to. The default version is versionless:
   * a leading segment that matches a version is the version, anything else
   * (or nothing) resolves to the default version.
   */
  resolveVersion(segments?: string[]): Promise<string>;
  getLicenses(): Promise<License[]>;
  getAuthors(): Promise<Author[]>;
  getSettings(): Promise<SiteSettings | null>;
}

const seo = (value: unknown): SeoData => {
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
};

const llm = (value: unknown): LlmData => {
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
};

/**
 * Lazy Markdoc AST accessor; never throws (empty document on read failure).
 * Keystatic types a content field as `{ node } | (() => Promise<{ node }>)`:
 * without `resolveLinkedFiles` the reader returns a lazy function, keeping
 * the content file unparsed until the body is actually rendered.
 */
function contentOf(
  read: (() => Promise<{ node: MarkdocNode }>) | { node: MarkdocNode },
) {
  return async () => {
    try {
      const value = typeof read === "function" ? await read() : read;
      return value.node;
    } catch {
      return Markdoc.parse("");
    }
  };
}

/** Raw stored shape of a navGroups item (conditional field). */
interface StoredNavItem {
  discriminant: string;
  value: {
    label?: string | null;
    url?: string | null;
    page?: string | null;
  };
}

interface StoredNavGroup {
  groupName?: string | null;
  items?: StoredNavItem[] | null;
}

/** Raw version entry: domain fields plus the stored navGroups structure. */
interface VersionEntry {
  version: ManualVersion;
  navGroups: StoredNavGroup[];
}

/** Everything read from the DAO in a single pass, shared by all rule sets. */
interface Snapshot {
  versionEntries: VersionEntry[];
  pageEntries: Awaited<ReturnType<Reader["collections"]["manualPages"]["all"]>>;
  materialEntries: Awaited<
    ReturnType<Reader["collections"]["materials"]["all"]>
  >;
  authors: Author[];
  licenses: License[];
  settings: SiteSettings | null;
}

/**
 * The concrete repository: it maps a Keystatic reader (treated as a plain
 * DAO) onto the domain models. It holds no policy of its own — caching and
 * draft-mode handling are added by the decorators composing the singleton.
 */
export class ReaderRuleSetRepository implements RuleSetRepository {
  public constructor(private readonly reader: Reader) {}

  public async findAll(): Promise<RuleSet[]> {
    const reader = this.reader;
    const snapshot: Snapshot = {
      versionEntries: await this.versionEntries(),
      pageEntries: await reader.collections.manualPages.all(),
      materialEntries: await reader.collections.materials.all(),
      authors: await this.getAuthors(),
      licenses: await this.getLicenses(),
      settings: await this.getSettings(),
    };

    const versions = snapshot.versionEntries
      .map((e) => e.version)
      .sort(
        (a, b) =>
          Number(b.isDefault) - Number(a.isDefault) ||
          a.slug.localeCompare(b.slug),
      );
    return Promise.all(versions.map((v) => this.ruleSet(v, snapshot)));
  }

  public async findOne(version: string): Promise<RuleSet | undefined> {
    return (await this.findAll()).find((r) => r.version.slug === version);
  }

  public async findPage(
    version: string,
    slugs: string[],
  ): Promise<ManualPage | undefined> {
    const ruleSet = await this.findOne(version);
    if (!ruleSet) return undefined;
    const key = slugs.join("/");
    return ruleSet.pages.find(
      (p) =>
        slugs.length === 0 ? p.slugs.length === 0 : p.slugs.join("/") === key,
    );
  }

  public async findMaterial(
    version: string,
    slug: string,
  ): Promise<Material | undefined> {
    const ruleSet = await this.findOne(version);
    return ruleSet?.materials.find((m) => m.slug === slug);
  }

  public async getNavPages(version: string): Promise<ManualNavPage[]> {
    const [ruleSet, defaultVersion] = await Promise.all([
      this.findOne(version),
      this.getDefaultVersion(),
    ]);
    if (!ruleSet) return [];
    const baseUrl = manualBaseUrl(version, defaultVersion);

    const pages: ManualNavPage[] = [];
    for (const group of ruleSet.manual) {
      for (const item of group.items) {
        if (item.type !== "page") continue;
        const rest = item.page.entrySlug.slice(version.length + 1);
        pages.push({
          entrySlug: item.page.entrySlug,
          title: item.page.title,
          url: rest === "index" ? baseUrl : `${baseUrl}/${rest}`,
          group: group.groupName ?? "",
        });
      }
    }
    return pages;
  }

  public async getVersions(): Promise<ManualVersion[]> {
    return (await this.versionEntries()).map((e) => e.version);
  }

  public async getDefaultVersion(): Promise<string> {
    const versions = await this.getVersions();
    return versions.find((v) => v.isDefault)?.slug ?? versions[0]?.slug ?? "1.0";
  }

  public async isValidVersion(version: string): Promise<boolean> {
    return (await this.getVersions()).some((v) => v.slug === version);
  }

  public async resolveVersion(segments?: string[]): Promise<string> {
    const first = segments?.[0];
    if (first && (await this.isValidVersion(first))) {
      const defaultVersion = await this.getDefaultVersion();
      return first === defaultVersion ? defaultVersion : first;
    }
    return this.getDefaultVersion();
  }

  public async getLicenses(): Promise<License[]> {
    const entries = await this.reader.collections.licenses.all();
    return entries.map((e) => ({
      slug: e.slug,
      name: e.entry.name,
      label: e.entry.label ?? e.entry.name,
      url: e.entry.url ?? null,
    }));
  }

  public async getAuthors(): Promise<Author[]> {
    const entries = await this.reader.collections.authors.all();
    return entries.map((e) => ({
      slug: e.slug,
      completeName: e.entry.completeName,
      filtrable: e.entry.filtrable !== false,
      avatar: e.entry.avatar ?? null,
      urls: (e.entry.urls ?? {}) as Record<string, string | null>,
    }));
  }

  public async getSettings(): Promise<SiteSettings | null> {
    const s = await this.reader.singletons.siteSettings.read();
    if (!s) return null;
    return {
      title: s.title ?? "",
      description: s.description ?? "",
      donateUrl: s.donateUrl ?? null,
      githubUrl: s.githubUrl ?? null,
      originalGameUrl: s.originalGameUrl ?? null,
      licenseSlug: s.license ?? null,
    };
  }

  // -------------------------------------------------------------------------
  // Mappers
  // -------------------------------------------------------------------------

  private async versionEntries(): Promise<VersionEntry[]> {
    const entries = await this.reader.collections.manualVersions.all();
    return entries.map((e) => ({
      version: {
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
      },
      navGroups: (e.entry.navGroups ?? []) as unknown as StoredNavGroup[],
    }));
  }

  private async ruleSet(version: ManualVersion, snapshot: Snapshot): Promise<RuleSet> {
    const licenseBySlug = new Map(
      snapshot.licenses.map((l) => [l.slug, l] as const),
    );
    const authorInfo = new Map(
      snapshot.authors.map(
        (a) => [a.slug, { name: a.completeName, filtrable: a.filtrable }] as const,
      ),
    );
    const contentLicense =
      snapshot.settings?.licenseSlug != null
        ? licenseBySlug.get(snapshot.settings.licenseSlug) ?? null
        : null;

    const pageByEntrySlug = new Map<string, ManualPage>();
    const pages = snapshot.pageEntries
      .filter((e) => e.slug.startsWith(`${version.slug}/`))
      .map((e) => {
        const rest = e.slug.slice(version.slug.length + 1); // 'index' | 'game-master/gm'
        const page: ManualPage = {
          slugs: rest === "index" ? [] : rest.split("/"),
          entrySlug: e.slug,
          title: e.entry.title,
          summary: e.entry.summary ?? "",
          image: e.entry.image ?? null,
          content: contentOf(e.entry.content),
          licenses: (e.entry.licenses ?? []).map((l) =>
            toMaterialLicense(l, licenseBySlug),
          ),
          seo: seo(e.entry.seo),
          llm: llm(e.entry.llm),
        };
        pageByEntrySlug.set(page.entrySlug, page);
        return page;
      });

    const materials = this.materialsOf(
      version.slug,
      snapshot,
      authorInfo,
      licenseBySlug,
    );

    const manual: ManualNavGroup[] = (
      snapshot.versionEntries.find((e) => e.version.slug === version.slug)
        ?.navGroups ?? []
    ).map((group) => ({
      groupName: group.groupName ?? null,
      items: (group.items ?? []).flatMap((item): ManualNavItemUnion[] => {
        if (item.discriminant === "url") {
          return [
            {
              type: "url",
              label: item.value.label || item.value.url || "",
              url: item.value.url ?? "",
              group: group.groupName ?? "",
            },
          ];
        }
        const page = item.value.page
          ? pageByEntrySlug.get(item.value.page)
          : undefined;
        return page
          ? [{ type: "page", page, group: group.groupName ?? "" }]
          : [];
      }),
    }));

    return {
      version,
      manual,
      pages,
      materials,
      license: contentLicense,
    };
  }

  private materialsOf(
    version: string,
    snapshot: Snapshot,
    authorInfo: Map<string, { name: string; filtrable: boolean }>,
    licenseBySlug: Map<string, License>,
  ): Material[] {
    const entries = snapshot.materialEntries.filter((e) =>
      e.slug.startsWith(`${version}/`),
    );
    const nameByEntry = new Map(
      entries.map((e) => [
        e.slug,
        (e.entry as unknown as { name: string }).name,
      ]),
    );
    const restOf = (entrySlug: string) => entrySlug.slice(version.length + 1);

    // Reverse lookup: which collection material contains each material.
    // Membership is single-source on the collection (its `contains` field).
    const collectionByMaterial = new Map<string, { slug: string; name: string }>();
    for (const e of entries) {
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

    return entries.map((e) => {
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
        licenses: Array<{ license: string | null; scope: string }> | null;
        contains: string[] | null;
        seo?: unknown;
        llm?: unknown;
        showcase: { image: string | null; heroName: string | null } | null;
        credits: Array<{
          discriminant: string;
          value: { author: string | null; kind: string; url: string | null };
        }>;
        assets: Array<{
          discriminant: "file" | "external";
          value: {
            name: string;
            file: string | null;
            url: string | null;
            thumbnail: string | null;
          };
        }>;
      };

      const credits = (entry.credits ?? []).map(
        (c): MaterialCredit => {
          const info = authorInfo.get(c.value.author ?? "");
          return {
            authorSlug: c.value.author ?? "",
            authorName: info?.name ?? c.value.author ?? "",
            authorFiltrable: info?.filtrable ?? true,
            kind: c.value.kind,
            url: c.value.url,
          };
        },
      );
      const assets = (entry.assets ?? []).map(
        (a): MaterialAsset => ({
          type: a.discriminant,
          name: a.value.name,
          file: a.value.file ?? null,
          url: a.value.url ?? null,
          thumbnail: a.value.thumbnail ?? null,
        }),
      );

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
        licenses: (entry.licenses ?? []).map((l) =>
          toMaterialLicense(l, licenseBySlug),
        ),
        contains: (entry.contains ?? []).map((member) => ({
          entrySlug: member,
          slug: restOf(member),
          name: nameByEntry.get(member) ?? member,
        })),
        showcase:
          entry.showcase?.image || entry.showcase?.heroName
            ? entry.showcase
            : null,
        credits,
        assets,
        content: contentOf(e.entry.content),
        seo: seo(entry.seo),
        llm: llm(entry.llm),
      };
    });
  }
}

function toMaterialLicense(
  l: { license: string | null; scope: string },
  licenseBySlug: Map<string, License>,
): MaterialLicense {
  const license = l.license ? licenseBySlug.get(l.license) : undefined;
  return {
    licenseSlug: l.license ?? "",
    licenseName: license?.name ?? l.license ?? "",
    licenseUrl: license?.url ?? null,
    scope: l.scope,
  };
}
