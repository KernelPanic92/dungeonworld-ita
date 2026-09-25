import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getManualPage, isValidManualVersion } from "@/lib/keystatic";
import { getManualSource } from "@/lib/source";
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { "manual-version": version, slug } = await params;
  const page = await getManualPage(version, slug ?? []);
  return {
    title: page?.title ?? "Manuale",
    description: page?.description,
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

  const { body: MdxContent, toc } = await compiler.compile({
    source: markdocToMdx(manualPage?.content ?? ""),
    filePath: `docs/manuale/pagine/${version}/${(slug ?? []).join("/")}/index.mdoc`,
  });

  return (
    <DocsPage toc={toc}>
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