import { dynamicLoader, llms } from "fumadocs-core/source";
import type {
  DynamicSource,
  LoaderOutput,
  Meta,
  MetaData,
  Page,
  VirtualFile,
} from "fumadocs-core/source";
import ruleSetRepository from "@/lib/content";
import type { Material } from "@/lib/content/models";
import { markdocSource } from "@/lib/content/markdoc/render";
import { getProgettoNode } from "@/lib/content/progetto";

interface SiteLlmPageData {
  title: string;
  description: string;
  notes: string[];
  /** Markdown body emitted by llms-full.txt (and the per-page llms.mdx route). */
  body: string;
}

type SiteLlmSourceConfig = {
  pageData: SiteLlmPageData;
  metaData: MetaData;
};

type SiteLlmLoaderConfig = {
  i18n: undefined;
  meta: Meta<undefined, MetaData>;
  page: Page<undefined, SiteLlmPageData>;
  source: undefined;
};

type SiteLlmLoader = LoaderOutput<SiteLlmLoaderConfig>;

let loaderPromise: Promise<SiteLlmLoader> | undefined;
let generatorPromise: ReturnType<typeof createSiteLlms> | undefined;

/**
 * The site-wide LLM source covering every area of the site: home, all manual
 * versions, all materials and the "progetto" page. Drives llms.txt,
 * llms-full.txt and the per-page llms.mdx routes.
 */
export async function getSiteLlms() {
  if (!generatorPromise) generatorPromise = createSiteLlms();
  return generatorPromise;
}

/** The shared LoaderOutput, for the per-page llms.mdx route. */
export async function getSiteLlmSource(): Promise<SiteLlmLoader> {
  if (!loaderPromise) {
    const [defaultVersion, settings] = await Promise.all([
      ruleSetRepository.getDefaultVersion(),
      ruleSetRepository.getSettings(),
    ]);
    const siteTitle = settings?.title ?? "";
    const siteDescription = settings?.description || "";
    const files = await buildSiteFiles(siteTitle, siteDescription);
    const input: DynamicSource<SiteLlmSourceConfig> = {
      async files(): Promise<VirtualFile<SiteLlmSourceConfig>[]> {
        return files;
      },
    };
    const loader = dynamicLoader(input, {
      baseUrl: "/",
      url: (slugs) => siteSlugToUrl(slugs, defaultVersion),
      pageTree: { sort: { by: "name", locales: "it" } },
    });
    loaderPromise = loader.get();
  }
  return loaderPromise;
}

async function createSiteLlms() {
  const [settings, versions, loader] = await Promise.all([
    ruleSetRepository.getSettings(),
    ruleSetRepository.getVersions(),
    getSiteLlmSource(),
  ]);
  const siteTitle = settings?.title ?? "";
  const siteDescription = settings?.description || "";
  const versionName = new Map(versions.map((v) => [v.slug, v.name]));

  return llms(() => loader, {
    renderName: (node) => {
      if (node.type === "root") return siteTitle;
      if (node.type === "page") {
        const page = loader.getNodePage(node);
        if (page?.data.title) return page.data.title;
        return String(node.name ?? "");
      }
      if (node.type === "folder") {
        // version folders (e.g. `manuale/1.0`) are named after the landing
        // page by default; use the version display name instead.
        const ref = (node as { $ref?: { folder?: string } }).$ref?.folder;
        const segs = ref?.split("/") ?? [];
        if (
          segs.length === 2 &&
          (segs[0] === "manuale" || segs[0] === "materiali")
        ) {
          const name = versionName.get(segs[1]);
          if (name) return name;
        }
      }
      return String(node.name ?? "");
    },
    renderDescription: (node) => {
      if (node.type === "root") return siteDescription;
      if (node.type === "page") {
        const page = loader.getNodePage(node);
        return page?.data.description ?? "";
      }
      return "";
    },
    renderPage,
  });
}

/**
 * Maps the loader slugs to the real public URL. Paths always nest the manual
 * version under the area (`manuale/1.0/...`, `materiali/2.0-beta/...`); the
 * default version is versionless in the URL.
 */
function siteSlugToUrl(slugs: string[], defaultVersion: string): string {
  const [area, first, ...rest] = slugs;
  if (area === "manuale") {
    if (first === defaultVersion) {
      return rest.length ? `/manuale/${rest.join("/")}` : "/manuale";
    }
    return `/${slugs.join("/")}`;
  }
  if (area === "materiali") {
    if (first === defaultVersion) {
      return `/materiali/${rest.join("/")}`;
    }
    return `/${first}/materiali/${rest.join("/")}`;
  }
  return `/${slugs.join("/")}`;
}

async function buildSiteFiles(
  siteTitle: string,
  siteDescription: string,
): Promise<VirtualFile<SiteLlmSourceConfig>[]> {
  const ruleSets = await ruleSetRepository.findAll();
  const files: VirtualFile<SiteLlmSourceConfig>[] = [];

  // Home: the site itself, as the root index entry.
  files.push({
    type: "page",
    path: "index.mdoc",
    data: {
      title: siteTitle,
      description: siteDescription,
      notes: [],
      body: siteDescription,
    },
  });

  // Manual: every version, pages in navGroups order (nav-referenced only).
  for (const ruleSet of ruleSets) {
    const version = ruleSet.version.slug;
    const pageByEntrySlug = new Map(
      ruleSet.pages.map((p) => [p.entrySlug, p] as const),
    );
    // getNavPages walks navGroups, so it yields the intended page order while
    // ruleSet.pages is in storage (filename) order.
    const navPages = await ruleSetRepository.getNavPages(version);
    for (const navPage of navPages) {
      const page = pageByEntrySlug.get(navPage.entrySlug);
      if (!page || page.llm.exclude) continue;
      const path =
        page.slugs.length === 0
          ? ["manuale", version, "index.mdoc"].join("/")
          : ["manuale", version, ...leafSegments(page.slugs)].join("/");
      files.push({
        type: "page",
        path,
        data: {
          title: page.title,
          description: page.llm.description || page.summary,
          notes: page.llm.notes,
          body: markdocSource(await page.content()),
        },
      });
    }
  }

  // Materials: every version.
  for (const ruleSet of ruleSets) {
    for (const material of ruleSet.materials) {
      if (material.llm.exclude) continue;
      files.push({
        type: "page",
        path: [
          "materiali",
          ruleSet.version.slug,
          ...leafSegments(material.slug.split("/")),
        ].join("/"),
        data: {
          title: material.name,
          description:
            material.llm.description || material.summary || material.flavor,
          notes: material.llm.notes,
          body: await materialBody(material),
        },
      });
    }
  }

  // Progetto: a folder so it sorts after Manuale/Materiali (pages sort
  // before folders in the tree); the folder takes its name from the page.
  files.push({
    type: "page",
    path: "progetto/index.mdoc",
    data: {
      title: "Progetto",
      description: "Il progetto di traduzione di Dungeon World in italiano.",
      notes: [],
      body: markdocSource(await getProgettoNode()),
    },
  });

  return files;
}

/** Last slug as a `.mdoc` leaf, so the page is not wrapped in a folder. */
function leafSegments(segments: string[]): string[] {
  const last = segments[segments.length - 1];
  const dirs = segments.slice(0, -1);
  return [...dirs, `${last}.mdoc`];
}

/**
 * Structured Markdown description for materials without textual content
 * (classes, monsters, equipment, ...): they have no body to render.
 */
async function materialBody(material: Material): Promise<string> {
  const node = await material.content();
  const rendered = markdocSource(node);
  if (rendered) return rendered;

  const lines: string[] = [];
  if (material.summary) lines.push(material.summary);
  if (material.flavor) lines.push(`> ${material.flavor}`);
  if (material.credits.length) {
    lines.push(
      `Crediti: ${material.credits
        .map((c) => `${c.authorName} (${c.kind})`)
        .join(", ")}`,
    );
  }
  if (material.licenses.length) {
    lines.push(
      `Licenze: ${material.licenses.map((l) => l.licenseName).join(", ")}`,
    );
  }
  if (material.contains.length) {
    lines.push(
      `Contiene: ${material.contains.map((c) => c.name).join(", ")}`,
    );
  }
  if (material.assets.length) {
    lines.push(`Download: ${material.assets.map((a) => a.name).join(", ")}`);
  }
  return lines.join("\n");
}

function renderPage(page: Page<undefined, SiteLlmPageData>): string {
  const { title, description, notes, body } = page.data;
  const parts: string[] = [`# ${title}`];
  if (description) parts.push(description);
  if (body) {
    // the content usually opens with the same H1: drop it to avoid duplication
    const h1 = new RegExp(
      `^#\\s+${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n+`,
    );
    parts.push(body.replace(h1, ""));
  }
  for (const note of notes ?? []) {
    if (note) parts.push(`Nota per l'AI: ${note}`);
  }
  return parts.join("\n");
}
