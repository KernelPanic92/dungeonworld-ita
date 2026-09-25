import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getManualPage, isValidManualVersion } from "@/lib/keystatic";
import { getManualSource } from "@/lib/source";

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

  return (
    <main className="prose prose-neutral dark:prose-invert max-w-none">
      <p className="text-xs text-muted-foreground">versione {version}</p>
      <h1>{page.data.title}</h1>
      {page.data.description ? <p>{page.data.description}</p> : null}
      <pre className="mt-8 whitespace-pre-wrap rounded-lg border bg-muted/50 p-4 text-sm">
        {manualPage?.content}
      </pre>
    </main>
  );
}
