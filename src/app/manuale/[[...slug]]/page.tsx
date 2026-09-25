import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  getDefaultManualVersion,
  getManualPage,
  isValidManualVersion,
} from "@/lib/keystatic";
import { getManualNavPages } from "@/lib/source";
import { compiler, markdocToMdx, mdxComponents } from "@/components/mdx";
import {
  DocsBody,
  DocsPage,
} from "fumadocs-ui/layouts/docs/page";
import { ManualSearch } from "@/components/materials/manual-search";

interface Props {
  params: Promise<{
    slug?: string[];
  }>;
}

/**
 * The version is the first slug segment: /manuale/1.0/game-master/gm.
 * - no segments → the default version's index
 * - first segment is not a version → legacy versionless URL
 *   (/manuale/come-giocare): permanent-redirect to the versioned form when
 *   the page exists in the default version, 404 otherwise
 */
async function resolveManualSlug(slug?: string[]) {
  const segments = slug ?? [];
  if (segments.length === 0) {
    permanentRedirect(`/manuale/${await getDefaultManualVersion()}`);
  }

  const [version, ...rest] = segments;
  if (!(await isValidManualVersion(version))) {
    const defaultVersion = await getDefaultManualVersion();
    const path = segments[0] === "index" ? [] : segments;
    if (await getManualPage(defaultVersion, path)) {
      permanentRedirect(`/manuale/${defaultVersion}/${path.join("/")}`);
    }
    notFound();
  }

  return { version, rest };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { version, rest } = await resolveManualSlug(slug);
  const page = await getManualPage(version, rest);
  // Orphan page (not in any navGroups): reachable for direct link or drafts,
  // but kept out of search engines.
  const navPages = await getManualNavPages(version);
  const entrySlug = `${version}/${rest.join("/") || "index"}`;
  const isOrphan = !navPages.some((p) => p.entrySlug === entrySlug);
  return {
    title: page?.title ?? "Manuale",
    description: page?.description,
    ...(isOrphan ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function ManualPage({ params }: Props) {
  const { slug } = await params;
  const { version, rest } = await resolveManualSlug(slug);

  const manualPage = await getManualPage(version, rest);
  if (!manualPage) notFound();

  const navPages = await getManualNavPages(version);
  const entrySlug = `${version}/${rest.join("/") || "index"}`;
  const index = navPages.findIndex((p) => p.entrySlug === entrySlug);

  // prev/next follow the navGroups order; orphans (not in the list) get none
  const previous = index > 0 ? navPages[index - 1] : undefined;
  const next =
    index >= 0 && index < navPages.length - 1 ? navPages[index + 1] : undefined;

  const { body: MdxContent, toc } = await compiler.compile({
    source: markdocToMdx(manualPage.content),
    filePath: `docs/manuale/pagine/${version}/${rest.join("/")}/index.mdoc`,
  });

  return (
    <DocsPage
      toc={toc}
      footer={{
        items: {
          previous: previous
            ? { name: previous.title, url: previous.url }
            : undefined,
          next: next ? { name: next.title, url: next.url } : undefined,
        },
      }}
    >
      <div className="mb-6 flex justify-end">
        <ManualSearch />
      </div>
      <DocsBody>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {manualPage.title}
        </h1>
        {manualPage.description ? (
          <p className="text-lg text-muted-foreground">{manualPage.description}</p>
        ) : null}
        <MdxContent components={mdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}
