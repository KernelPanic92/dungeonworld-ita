import type {
  AboutPageLeaf,
  BreadcrumbListLeaf,
  CollectionPageLeaf,
  CreativeWorkLeaf,
  Game,
  ItemListLeaf,
  ListItemLeaf,
  OrganizationLeaf,
  PersonLeaf,
  TechArticleLeaf,
  WebSiteLeaf,
  WithContext,
} from "schema-dts";
import type { Material, ManualPage, ManualVersion, SiteSettings } from "./keystatic";
import { absoluteUrl } from "./site";

const SITE_NAME = "Dungeon World Italia";

// Material type → schema.org type. Textual materials are Article, collections
// are CollectionPage (their `contains` list becomes hasPart), everything else
// stays a generic CreativeWork.
const MATERIAL_TYPE_TO_SCHEMA: Record<string, MaterialSchemaType> = {
  insight: "Article",
  setting: "Article",
  campaign: "Article",
  oneshot: "Article",
  collection: "CollectionPage",
};

type MaterialSchemaType = "Article" | "CollectionPage" | "CreativeWork";

function siteName(settings: SiteSettings | null): string {
  return settings?.title || SITE_NAME;
}

// ---------------------------------------------------------------------------
// Site-wide
// ---------------------------------------------------------------------------

export function webSiteJsonLd(
  settings: SiteSettings | null,
): WithContext<WebSiteLeaf> {
  const url = absoluteUrl("/");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}#website`,
    url,
    name: siteName(settings),
    ...(settings?.description ? { description: settings.description } : {}),
    inLanguage: "it",
  };
}

export function organizationJsonLd(
  settings: SiteSettings | null,
): WithContext<OrganizationLeaf> {
  const url = absoluteUrl("/");
  const sameAs = [settings?.githubUrl, settings?.donateUrl].filter(
    (u): u is string => Boolean(u),
  );
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}#organization`,
    url,
    name: siteName(settings),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

// ---------------------------------------------------------------------------
// Manual editions (TabletopGame)
// ---------------------------------------------------------------------------

/**
 * Stable @id of a manual edition, referenced from materials and manual pages
 * and declared globally (in the root layout) alongside WebSite/Organization.
 * schema-dts has no `TabletopGame` type yet, so this is typed as `Game`.
 */
function gameId(versionSlug: string): string {
  return `${absoluteUrl("/")}#game-${versionSlug}`;
}

export function tabletopGameJsonLd(version: ManualVersion): WithContext<Game> {
  const predecessorId = version.predecessor ? gameId(version.predecessor) : null;
  const sameAs = version.externalIdentifiers
    .map((i) => i.url)
    .filter((u): u is string => Boolean(u));
  return {
    "@context": "https://schema.org",
    "@type": "Game",
    "@id": gameId(version.slug),
    name: version.name,
    version: version.slug,
    creativeWorkStatus: version.creativeWorkStatus,
    ...(version.url ? { url: absoluteUrl(version.url) } : {}),
    ...(predecessorId
      ? {
          successorOf: { "@id": predecessorId },
          isVariantOf: { "@id": predecessorId },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
    // schema-dts has no `TabletopGame` type yet: `Game` is its closest
    // ancestor, and successorOf/isVariantOf are not declared on Game.
  } satisfies WithContext<Game>;
}

// ---------------------------------------------------------------------------
// Breadcrumbs
// ---------------------------------------------------------------------------

export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
): WithContext<BreadcrumbListLeaf> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })) satisfies ListItemLeaf[],
  };
}

// ---------------------------------------------------------------------------
// Manual pages
// ---------------------------------------------------------------------------

export function manualPageJsonLd(opts: {
  page: ManualPage;
  /** Public path of this page (e.g. `/manuale/classi/barbaro`). */
  url: string;
  /** Manual version slug, for the TabletopGame reference. */
  version: string;
  /** Public image URL, when the page has a cover or SEO image. */
  image: string | null;
  publisherName: string;
}): WithContext<TechArticleLeaf> {
  const { page, url, version, image, publisherName } = opts;
  const seo = page.seo;
  const licenses = page.licenses
    .map((l) => l.licenseUrl)
    .filter((u): u is string => Boolean(u));
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": absoluteUrl(url),
    mainEntityOfPage: absoluteUrl(url),
    headline: seo.title || page.title,
    name: page.title,
    ...(seo.description || page.summary
      ? { description: seo.description || page.summary }
      : {}),
    inLanguage: "it",
    ...(image ? { image: absoluteUrl(image) } : {}),
    isPartOf: { "@id": gameId(version) },
    publisher: {
      "@type": "Organization",
      name: publisherName,
      url: absoluteUrl("/"),
    } satisfies OrganizationLeaf,
    ...(licenses.length ? { license: licenses } : {}),
  };
}

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------

function creditPerson(credit: Material["credits"][number]): PersonLeaf {
  return {
    "@type": "Person",
    name: credit.authorName || credit.authorSlug,
    ...(credit.url ? { url: credit.url } : {}),
  };
}

function materialEntity(
  material: Material,
  url: string,
  schemaType: MaterialSchemaType,
  publisherName: string,
  makeUrl: (slug: string) => string,
): WithContext<CreativeWorkLeaf> {
  const seo = material.seo;
  const image = seo.image || material.thumbnail;
  const authors = material.credits
    .filter((c) => c.kind === "author")
    .map(creditPerson);
  const contributors = material.credits
    .filter((c) => c.kind !== "author")
    .map(creditPerson);
  const licenses = material.licenses
    .map((l) => l.licenseUrl)
    .filter((u): u is string => Boolean(u));

  // Every material belongs to the manual edition it declares (its `version`),
  // and to its collection when it has one.
  const isPartOf: Array<
    | { "@id": string }
    | { "@type": "CollectionPage"; name: string; url: string }
  > = [{ "@id": gameId(material.version) }];
  if (material.collection) {
    isPartOf.push({
      "@type": "CollectionPage",
      name: material.collection.name,
      url: absoluteUrl(makeUrl(material.collection.slug)),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    "@id": absoluteUrl(url),
    mainEntityOfPage: absoluteUrl(url),
    headline: seo.title || material.name,
    name: material.name,
    ...(seo.description || material.summary || material.flavor
      ? { description: seo.description || material.summary || material.flavor }
      : {}),
    inLanguage: "it",
    ...(image ? { image: absoluteUrl(image) } : {}),
    ...(material.date ? { datePublished: material.date } : {}),
    ...(material.version ? { version: material.version } : {}),
    ...(authors.length ? { author: authors } : {}),
    ...(contributors.length ? { contributor: contributors } : {}),
    ...(licenses.length ? { license: licenses } : {}),
    isPartOf,
    publisher: {
      "@type": "Organization",
      name: publisherName,
      url: absoluteUrl("/"),
    } satisfies OrganizationLeaf,
  } as WithContext<CreativeWorkLeaf>;
}

/**
 * JSON-LD for a material detail page. Returns an array: a collection yields a
 * CollectionPage whose members are listed in `hasPart`, every other type a
 * single entity (Article or CreativeWork).
 *
 * @param prefix Version URL prefix: `""` for the default version (versionless
 *   `/materiali/...`), `/2.0-beta` for the others.
 */
export function materialJsonLd(opts: {
  material: Material;
  url: string;
  publisherName: string;
  prefix: string;
}): WithContext<CreativeWorkLeaf>[] {
  const { material, url, publisherName, prefix } = opts;
  const schemaType =
    MATERIAL_TYPE_TO_SCHEMA[material.type] ?? ("CreativeWork" as const);
  const makeUrl = (slug: string) => `${prefix}/materiali/${slug}`;

  if (material.type === "collection") {
    return [
      {
        ...materialEntity(material, url, "CollectionPage", publisherName, makeUrl),
        hasPart: material.contains.map((c) => ({
          "@type": "CreativeWork",
          name: c.name,
          url: absoluteUrl(makeUrl(c.slug)),
        })),
      },
    ];
  }

  return [materialEntity(material, url, schemaType, publisherName, makeUrl)];
}

// ---------------------------------------------------------------------------
// Material index
// ---------------------------------------------------------------------------

export function materialsIndexJsonLd(opts: {
  materials: Material[];
  url: string;
  description?: string;
  prefix: string;
}): WithContext<CollectionPageLeaf> {
  const { materials, url, description, prefix } = opts;
  const makeUrl = (slug: string) => `${prefix}/materiali/${slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": absoluteUrl(url),
    mainEntityOfPage: absoluteUrl(url),
    name: "Materiali",
    ...(description ? { description } : {}),
    inLanguage: "it",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: materials.map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CreativeWork",
          name: m.name,
          url: absoluteUrl(makeUrl(m.slug)),
          // each material declares its own edition via its `version`
          isPartOf: { "@id": gameId(m.version) },
        },
      })),
    } satisfies ItemListLeaf,
  };
}

// ---------------------------------------------------------------------------
// Static pages
// ---------------------------------------------------------------------------

export function aboutPageJsonLd(opts: {
  url: string;
  title: string;
  description?: string;
}): WithContext<AboutPageLeaf> {
  const { url, title, description } = opts;
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": absoluteUrl(url),
    mainEntityOfPage: absoluteUrl(url),
    name: title,
    ...(description ? { description } : {}),
    inLanguage: "it",
  };
}