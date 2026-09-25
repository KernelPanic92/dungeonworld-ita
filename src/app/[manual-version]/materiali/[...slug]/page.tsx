import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMaterial, isValidManualVersion } from "@/lib/keystatic";
import { materialFileUrl } from "@/lib/materials";
import { cn } from "cn";
import { mdxComponents, compiler, markdocToMdx } from "@/components/mdx";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  MATERIAL_SOURCE_OPTIONS,
  MATERIAL_TYPE_OPTIONS,
} from "@/lib/materials-parsers";
import {
  Download,
  ExternalLink,
  FileText,
  Calendar,
  LinkIcon,
  ArrowLeft,
} from "lucide-react";

interface Props {
  params: Promise<{
    "manual-version": string;
    slug?: string[];
  }>;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { "manual-version": version, slug } = await params;
  const material = await getMaterial(version, (slug ?? []).join("/"));
  if (!material) return {};
  return {
    title: material.name,
    description: material.shortDescription || material.description,
  };
}

export default async function MaterialDetailPage({ params }: Props) {
  const { "manual-version": version, slug } = await params;
  if (!(await isValidManualVersion(version))) notFound();

  const material = await getMaterial(version, (slug ?? []).join("/"));
  if (!material) notFound();

  const typeLabel =
    MATERIAL_TYPE_OPTIONS.find((t) => t.value === material.type)?.label ??
    material.type;
  const sourceLabel =
    MATERIAL_SOURCE_OPTIONS.find((s) => s.value === material.source)?.label ??
    material.source;

  const showcaseUrl = material.showcase?.image
    ? materialFileUrl(material, version, material.showcase.image)
    : null;

  const { body: MdxContent } = await compiler.compile({
    source: markdocToMdx(material.content),
    filePath: `docs/materiali/${version}/${material.slug}/index.mdoc`,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={`/${version}/materiali`} className="inline-flex items-center gap-1.5 hover:text-foreground">
          <ArrowLeft className="size-4" />
          Tutti i materiali
        </Link>
      </nav>

      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start">
        {showcaseUrl ? (
          <div className="w-full max-w-sm shrink-0 overflow-hidden rounded-lg border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={showcaseUrl}
              alt={material.showcase?.heroName ?? material.name}
              className="w-full object-cover"
            />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant="secondary">{typeLabel}</Badge>
            <Badge
              variant={material.source === "official" ? "default" : "outline"}
              className={
                material.source === "official" ? "bg-dw text-on-dw" : undefined
              }
            >
              {sourceLabel}
            </Badge>
            {material.version ? <Badge variant="outline">v{material.version}</Badge> : null}
            {material.date ? (
              <Badge variant="outline" className="gap-1">
                <Calendar className="size-3" />
                {new Date(material.date).toLocaleDateString("it-IT")}
              </Badge>
            ) : null}
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {material.name}
          </h1>
          {material.collection ? (
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {material.collection}
            </p>
          ) : null}

          {material.description ? (
            <p className="mt-4 text-lg text-muted-foreground">
              {material.description}
            </p>
          ) : null}
        </div>
      </div>

      {material.assets.length > 0 ? (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">Download</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {material.assets.map((asset) => {
              const href =
                asset.type === "file" && asset.file
                  ? materialFileUrl(material, version, asset.file)
                  : asset.url;
              if (!href) return null;
              return (
                <a
                  key={`${asset.type}-${asset.name}`}
                  href={href}
                  target={asset.type === "external" ? "_blank" : undefined}
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "justify-start gap-2",
                  )}
                >
                  {asset.type === "file" ? (
                    <FileText className="size-4 shrink-0" />
                  ) : (
                    <ExternalLink className="size-4 shrink-0" />
                  )}
                  <span className="truncate">{asset.name}</span>
                  {asset.type === "file" ? (
                    <Download className="ml-auto size-4 shrink-0 text-muted-foreground" />
                  ) : null}
                </a>
              );
            })}
          </div>
        </section>
      ) : null}

      {material.credits.length > 0 ? (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">Crediti</h2>
          <ul className="flex flex-col gap-2">
            {material.credits.map((credit, i) => (
              <li key={i} className="flex items-baseline gap-2 text-sm">
                <span className="text-muted-foreground">{credit.kind}:</span>
                {credit.url ? (
                  <a
                    href={credit.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
                  >
                    {credit.authorName || credit.authorSlug}
                    <LinkIcon className="size-3" />
                  </a>
                ) : (
                  <span className="font-medium">
                    {credit.authorName || credit.authorSlug}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {material.license ? (
        <section className="mb-8 text-sm text-muted-foreground">
          Licenza:{" "}
          {material.license.url ? (
            <a
              href={material.license.url}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {material.license.name}
            </a>
          ) : (
            material.license.name
          )}
        </section>
      ) : null}

      {material.content ? (
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <MdxContent components={mdxComponents} />
        </article>
      ) : null}
    </div>
  );
}