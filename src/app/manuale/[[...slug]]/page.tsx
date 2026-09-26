import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ruleSetRepository from "@/lib/content";
import { manualBaseUrl } from "@/lib/content";
import { renderMarkdoc } from "@/lib/content/markdoc/render";
import { AdSenseAd } from "@/components/ads/adsense";
import { ADSENSE_SLOT_BANNER } from "@/lib/tracking";
import { JsonLd } from "@/components/site/json-ld";
import { breadcrumbJsonLd, manualPageJsonLd } from "@/lib/schema-org";
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
  const defaultVersion = await ruleSetRepository.getDefaultVersion();

  if (segments.length === 0) {
    return { version: defaultVersion, rest: [] };
  }

  const [version, ...rest] = segments;
  if (version === defaultVersion) {
    // canonical URLs of the default version are versionless
    permanentRedirect(`/manuale${rest.length ? `/${rest.join("/")}` : ""}`);
  }
  if (await ruleSetRepository.isValidVersion(version)) {
    return { version, rest };
  }

  // no version prefix: default version
  return { version: defaultVersion, rest: segments };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { version, rest } = await resolveManualSlug(slug);
  const page = await ruleSetRepository.findPage(version, rest);
  const defaultVersion = await ruleSetRepository.getDefaultVersion();
  const baseUrl = manualBaseUrl(version, defaultVersion);
  const pagePath = rest.length === 0 ? baseUrl : `${baseUrl}/${rest.join("/")}`;
  if (!page && rest.length === 0) {
    // version landing (no content yet): from the version entry
    const entry = (await ruleSetRepository.getVersions()).find(
      (v) => v.slug === version,
    );
    return {
      title: entry?.name ?? "Manuale",
      description: entry?.description,
      alternates: { canonical: pagePath },
    };
  }
  // Orphan page (not in any navGroups): reachable for direct link or drafts,
  // but kept out of search engines.
  const navPages = await ruleSetRepository.getNavPages(version);
  const entrySlug = `${version}/${rest.join("/") || "index"}`;
  const isOrphan = !navPages.some((p) => p.entrySlug === entrySlug);
  const seo = page?.seo;
  const title = seo?.title || page?.title || "Manuale";
  const description = seo?.description || page?.summary;
  const image = seo?.image || page?.image
    ? seo?.image || `/files/manuale/pagine/${entrySlug}/${page?.image}`
    : null;
  return {
    title,
    description,
    alternates: { canonical: pagePath },
    openGraph: {
      title,
      description,
      url: pagePath,
      type: "article",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    ...(isOrphan || seo?.noIndex
      ? { robots: { index: false, follow: false } }
      : {}),
  };
}

export default async function ManualPage({ params }: Props) {
  const { slug } = await params;
  const { version, rest } = await resolveManualSlug(slug);

  const manualPage = await ruleSetRepository.findPage(version, rest);
  if (!manualPage) {
    // version with no content yet: landing page from the version entry
    if (rest.length === 0) {
      const entry = (await ruleSetRepository.getVersions()).find(
        (v) => v.slug === version,
      );
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

  const navPages = await ruleSetRepository.getNavPages(version);
  const entrySlug = `${version}/${rest.join("/") || "index"}`;
  const index = navPages.findIndex((p) => p.entrySlug === entrySlug);

  // prev/next follow the navGroups order; orphans (not in the list) get none
  const previous = index > 0 ? navPages[index - 1] : undefined;
  const next =
    index >= 0 && index < navPages.length - 1 ? navPages[index + 1] : undefined;

  const defaultVersion = await ruleSetRepository.getDefaultVersion();
  const baseUrl = manualBaseUrl(version, defaultVersion);
  const pagePath = rest.length === 0 ? baseUrl : `${baseUrl}/${rest.join("/")}`;
  const isOrphan = index === -1;
  const isIndexed = !isOrphan && !manualPage.seo.noIndex;

  const settings = await ruleSetRepository.getSettings();
  const publisherName = settings?.title || "Dungeon World Italia";

  const image = manualPage.seo.image || manualPage.image
    ? manualPage.seo.image || `/files/manuale/pagine/${entrySlug}/${manualPage.image}`
    : null;

  const { content, toc } = renderMarkdoc(await manualPage.content());

  return (
    <DocsPage
      toc={toc}
      // ad unit at the top of the table of contents, with reserved height
      // to avoid layout shift while the unit loads
      tableOfContent={{
        header: (
          <div className="flex flex-col items-start gap-4 pb-4">
            <AdSenseAd containerClassName="w-full min-h-[250px]" />
          </div>
        ),
      }}
      footer={{
        items: {
          previous: previous
            ? { name: previous.title, url: previous.url,  description: 'Precedente' }
            : undefined,
          next: next ? { name: next.title, url: next.url, description: 'Successiva' } : undefined,
        },
      }}
    >
      {isIndexed ? (
        <JsonLd
          data={[
            manualPageJsonLd({
              page: manualPage,
              url: pagePath,
              version,
              image,
              publisherName,
            }),
            breadcrumbJsonLd([
              { name: "Home", url: "/" },
              { name: "Manuale", url: baseUrl },
              ...(rest.length > 0 ? [{ name: manualPage.title, url: pagePath }] : []),
            ]),
          ]}
        />
      ) : null}
      <DocsBody>{content}</DocsBody>
      {/* horizontal banner between the manual body and the prev/next footer */}
      <AdSenseAd
        slot={ADSENSE_SLOT_BANNER}
        format="horizontal"
        containerClassName="mt-8 min-h-[90px]"
      />
    </DocsPage>
  );
}
