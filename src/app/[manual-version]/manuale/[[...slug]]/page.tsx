import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getManualPage, isValidManualVersion } from "@/lib/keystatic";
import {
  getManualNavPages,
  getManualSource,
} from "@/lib/source";
import { compiler, markdocToMdx, mdxComponents } from "@/components/mdx";
import {
  DocsBody,
  DocsPage,
} from "fumadocs-ui/layouts/docs/page";
import { ManualSearch } from "@/components/materials/manual-search";

interface Props {
  params: Promise<{
    "manual-version": string;
    slug?: string[];
  }>;
}

function entrySlugFor(version: string, slug?: string[]) {
  const rest = (slug ?? []).join("/");
  return `${version}/${rest || "index"}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { "manual-version": version, slug } = await params;
  const page = await getManualPage(version, slug ?? []);
  // Orphan page (not in any navGroups): reachable for direct link or drafts,
  // but kept out of search engines.
  const navPages = await getManualNavPages(version);
  const isOrphan = !navPages.some((p) => p.entrySlug === entrySlugFor(version, slug));
  return {
    title: page?.title ?? "Manuale",
    description: page?.description,
    ...(isOrphan ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function ManualPage({ params }: Props) {
  const { "manual-version": version, slug } = await params;

  if (!(await isValidManualVersion(version))) notFound();

  const source = await getManualSource(version);
  const loader = await source.get();
  const page = loader.getPage(slug ?? []);
  if (!page) notFound();

  const manualPage = await getManualPage(version, slug ?? []);
  const navPages = await getManualNavPages(version);
  const entrySlug = entrySlugFor(version, slug);
  const index = navPages.findIndex((p) => p.entrySlug === entrySlug);

  // prev/next follow the navGroups order; orphans (not in the list) get none
  const previous = index > 0 ? navPages[index - 1] : undefined;
  const next =
    index >= 0 && index < navPages.length - 1 ? navPages[index + 1] : undefined;

  const { body: MdxContent, toc } = await compiler.compile({
    source: markdocToMdx(manualPage?.content ?? ""),
    filePath: `docs/manuale/pagine/${version}/${(slug ?? []).join("/")}/index.mdoc`,
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
        <ManualSearch version={version} />
      </div>
      <DocsBody>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {page.data.title}
        </h1>
        {page.data.description ? (
          <p className="text-lg text-muted-foreground">{page.data.description}</p>
        ) : null}
        <MdxContent components={mdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}