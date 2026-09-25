import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  getDefaultManualVersion,
  getManualPage,
  getManualVersions,
  isValidManualVersion,
} from "@/lib/keystatic";
import { getManualNavPages } from "@/lib/source";
import { compiler, markdocToMdx, mdxComponents } from "@/components/mdx";
import { AdSenseAd } from "@/components/ads/adsense";
import { KoFiButton } from "@/components/site/kofi";
import {
  DocsBody,
  DocsPage,
} from "fumadocs-ui/layouts/docs/page";

interface Props {
  params: Promise<{
    slug?: string[];
  }>;
}

/**
 * Resolves a manual URL. The default version is versionless: its pages live
 * at /manuale/<path>. A leading segment that matches a version is the version
 * (except the default one, which redirects to its versionless canonical URL);
 * anything else belongs to the default version.
 */
async function resolveManualSlug(slug?: string[]) {
  const segments = slug ?? [];
  const defaultVersion = await getDefaultManualVersion();

  if (segments.length === 0) {
    return { version: defaultVersion, rest: [] };
  }

  const [version, ...rest] = segments;
  if (version === defaultVersion) {
    // canonical URLs of the default version are versionless
    permanentRedirect(`/manuale${rest.length ? `/${rest.join("/")}` : ""}`);
  }
  if (await isValidManualVersion(version)) {
    return { version, rest };
  }

  // no version prefix: default version
  return { version: defaultVersion, rest: segments };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { version, rest } = await resolveManualSlug(slug);
  const page = await getManualPage(version, rest);
  if (!page && rest.length === 0) {
    // version landing (no content yet): from the version entry
    const entry = (await getManualVersions()).find((v) => v.slug === version);
    return { title: entry?.name ?? "Manuale", description: entry?.description };
  }
  // Orphan page (not in any navGroups): reachable for direct link or drafts,
  // but kept out of search engines.
  const navPages = await getManualNavPages(version);
  const entrySlug = `${version}/${rest.join("/") || "index"}`;
  const isOrphan = !navPages.some((p) => p.entrySlug === entrySlug);
  const seo = page?.seo;
  return {
    title: seo?.title || page?.title || "Manuale",
    description: seo?.description || page?.summary,
    ...(seo?.image
      ? {
          openGraph: {
            title: seo.title || page?.title || "Manuale",
            description: seo.description || page?.summary,
            images: [{ url: seo.image }],
          },
        }
      : {}),
    ...(isOrphan || seo?.noIndex
      ? { robots: { index: false, follow: false } }
      : {}),
  };
}

export default async function ManualPage({ params }: Props) {
  const { slug } = await params;
  const { version, rest } = await resolveManualSlug(slug);

  const manualPage = await getManualPage(version, rest);
  if (!manualPage) {
    // version with no content yet: landing page from the version entry
    if (rest.length === 0) {
      const entry = (await getManualVersions()).find((v) => v.slug === version);
      if (entry) {
        return (
          <DocsPage>
            <DocsBody />
          </DocsPage>
        );
      }
    }
    notFound();
  }

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
      // support button + ad unit at the top of the table of contents
      tableOfContent={{
        header: (
          <div className="flex flex-col items-start gap-4 pb-4">
            <KoFiButton />
            <AdSenseAd />
          </div>
        ),
      }}
      footer={{
        items: {
          previous: previous
            ? { name: previous.title, url: previous.url }
            : undefined,
          next: next ? { name: next.title, url: next.url } : undefined,
        },
      }}
    >
      <DocsBody>
        <MdxContent components={mdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}
