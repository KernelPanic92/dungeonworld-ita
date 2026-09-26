import { structure } from "fumadocs-core/mdx-plugins";
import type {
  DynamicSource,
  MetaData,
  VirtualFile,
} from "fumadocs-core/source";
import ruleSetRepository from "@/lib/content";
import type { RuleSetRepository } from "@/lib/content/rule-set-repository";
import { markdocSource } from "./markdoc/render";

/**
 * Fumadocs-native source of the manual: one virtual file per nav-referenced
 * page across every rule set (versions). Built on top of the
 * RuleSetRepository, it feeds the unified search index.
 */
export interface ManualSourcePageData {
  title: string;
  description: string;
  structuredData: ReturnType<typeof structure>;
  /** Public URL (versionless for the default version) */
  url: string;
  /** Version slug; used as the search `tag` so results can be scoped per version */
  version: string;
  /** Version display name */
  versionName: string;
  /** navGroups group of the page ("" for root-level pages) */
  group: string;
}

export type ManualSourceConfig = {
  pageData: ManualSourcePageData;
  metaData: MetaData;
};

export class ManualSourceProvider {
  public constructor(
    private readonly ruleSets: RuleSetRepository = ruleSetRepository,
  ) {}

  public async build(): Promise<DynamicSource<ManualSourceConfig>> {
    return { files: () => this.files() };
  }

  private async files(): Promise<VirtualFile<ManualSourceConfig>[]> {
    const ruleSets = await this.ruleSets.findAll();
    const files: VirtualFile<ManualSourceConfig>[] = [];

    for (const ruleSet of ruleSets) {
      const version = ruleSet.version.slug;
      const navPages = await this.ruleSets.getNavPages(version);
      const pageBySlug = new Map(
        ruleSet.pages.map((p) => [p.entrySlug, p] as const),
      );

      for (const nav of navPages) {
        const page = pageBySlug.get(nav.entrySlug);
        if (!page) continue;
        files.push({
          type: "page",
          path:
            page.slugs.length === 0
              ? `${version}/index.mdoc`
              : `${version}/${page.slugs.join("/")}/index.mdoc`,
          data: {
            title: page.title,
            description: page.summary,
            structuredData: structure(markdocSource(await page.content())),
            url: nav.url,
            version,
            versionName: ruleSet.version.name,
            group: nav.group,
          },
        });
      }
    }
    return files;
  }
}

const manualSourceProvider = new ManualSourceProvider();
export default manualSourceProvider;
