import readerFactory, {
  currentDraftBranch,
  type ReaderFactory,
} from "./reader-factory";
import { ReaderRuleSetRepository } from "./rule-set-repository";
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
 * Proxy that switches the backing repository on Keystatic previews: while
 * draft mode is active, reads go to an uncached repository bound to a
 * GitHub reader of the previewed branch (one per branch, flyweight);
 * otherwise the wrapped (local, cached) repository is used as-is.
 */
export class DraftModeInterceptorRuleSetRepository implements RuleSetRepository {
  private readonly draftRepositories = new Map<string, RuleSetRepository>();

  public constructor(
    private readonly repository: RuleSetRepository,
    private readonly readers: ReaderFactory = readerFactory,
  ) {}

  private async getRepository(): Promise<RuleSetRepository> {
    const branch = await currentDraftBranch();
    if (!branch) return this.repository;

    let draft = this.draftRepositories.get(branch);
    if (!draft) {
      draft = new ReaderRuleSetRepository(await this.readers.forBranch(branch));
      this.draftRepositories.set(branch, draft);
    }
    return draft;
  }

  public async findAll(): Promise<RuleSet[]> {
    return (await this.getRepository()).findAll();
  }

  public async findOne(version: string): Promise<RuleSet | undefined> {
    return (await this.getRepository()).findOne(version);
  }

  public async findPage(
    version: string,
    slugs: string[],
  ): Promise<ManualPage | undefined> {
    return (await this.getRepository()).findPage(version, slugs);
  }

  public async findMaterial(
    version: string,
    slug: string,
  ): Promise<Material | undefined> {
    return (await this.getRepository()).findMaterial(version, slug);
  }

  public async getNavPages(version: string): Promise<ManualNavPage[]> {
    return (await this.getRepository()).getNavPages(version);
  }

  public async getVersions(): Promise<ManualVersion[]> {
    return (await this.getRepository()).getVersions();
  }

  public async getDefaultVersion(): Promise<string> {
    return (await this.getRepository()).getDefaultVersion();
  }

  public async isValidVersion(version: string): Promise<boolean> {
    return (await this.getRepository()).isValidVersion(version);
  }

  public async resolveVersion(segments?: string[]): Promise<string> {
    return (await this.getRepository()).resolveVersion(segments);
  }

  public async getLicenses(): Promise<License[]> {
    return (await this.getRepository()).getLicenses();
  }

  public async getAuthors(): Promise<Author[]> {
    return (await this.getRepository()).getAuthors();
  }

  public async getSettings(): Promise<SiteSettings | null> {
    return (await this.getRepository()).getSettings();
  }
}
