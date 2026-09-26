import { cache } from "react";
import type {
  Author,
  License,
  ManualPage,
  ManualVersion,
  Material,
  RuleSet,
  SiteSettings,
} from "./models";
import type { ManualNavPage, RuleSetRepository } from "./rule-set-repository";

/**
 * Proxy that memoises the reads of the wrapped repository for the lifetime
 * of the current request (React `cache()`), so a page render performs one
 * read per datum regardless of how many consumers ask for it. Composed
 * around the local repository only: preview (draft mode) repositories are
 * deliberately uncached, so previews always reflect the saved content.
 */
export class CachedRuleSetRepository implements RuleSetRepository {
  private readonly findAllCache: () => Promise<RuleSet[]>;
  private readonly findOneCache: (version: string) => Promise<RuleSet | undefined>;
  private readonly findPageCache: (
    version: string,
    slugs: string[],
  ) => Promise<ManualPage | undefined>;
  private readonly findMaterialCache: (
    version: string,
    slug: string,
  ) => Promise<Material | undefined>;
  private readonly getNavPagesCache: (version: string) => Promise<ManualNavPage[]>;
  private readonly getVersionsCache: () => Promise<ManualVersion[]>;
  private readonly getLicensesCache: () => Promise<License[]>;
  private readonly getAuthorsCache: () => Promise<Author[]>;
  private readonly getSettingsCache: () => Promise<SiteSettings | null>;

  public constructor(private readonly repository: RuleSetRepository) {
    this.findAllCache = cache(() => this.repository.findAll());
    this.findOneCache = cache((version: string) =>
      this.repository.findOne(version), 
    );
    this.findPageCache = cache((version: string, slugs: string[]) =>
      this.repository.findPage(version, slugs),
    );
    this.findMaterialCache = cache((version: string, slug: string) =>
      this.repository.findMaterial(version, slug),
    );
    this.getNavPagesCache = cache((version: string) =>
      this.repository.getNavPages(version),
    );
    this.getVersionsCache = cache(() => this.repository.getVersions());
    this.getLicensesCache = cache(() => this.repository.getLicenses());
    this.getAuthorsCache = cache(() => this.repository.getAuthors());
    this.getSettingsCache = cache(() => this.repository.getSettings());
  }

  public findAll(): Promise<RuleSet[]> {
    return this.findAllCache();
  }

  public findOne(version: string): Promise<RuleSet | undefined> {
    return this.findOneCache(version);
  }

  public findPage(
    version: string,
    slugs: string[],
  ): Promise<ManualPage | undefined> {
    return this.findPageCache(version, slugs);
  }

  public findMaterial(
    version: string,
    slug: string,
  ): Promise<Material | undefined> {
    return this.findMaterialCache(version, slug);
  }

  public getNavPages(version: string): Promise<ManualNavPage[]> {
    return this.getNavPagesCache(version);
  }

  public getVersions(): Promise<ManualVersion[]> {
    return this.getVersionsCache();
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

  public getLicenses(): Promise<License[]> {
    return this.getLicensesCache();
  }

  public getAuthors(): Promise<Author[]> {
    return this.getAuthorsCache();
  }

  public getSettings(): Promise<SiteSettings | null> {
    return this.getSettingsCache();
  }
}
