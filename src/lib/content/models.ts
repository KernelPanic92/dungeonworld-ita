import type { Node as MarkdocNode } from "@markdoc/markdoc";

/**
 * Domain models of the application, decoupled from the Keystatic schemas.
 * They are populated by the RuleSetRepository; the aggregate root is the
 * RuleSet (a manual version with its pages and materials). Content bodies
 * are exposed lazily as Markdoc AST nodes — no raw-text extraction happens
 * in the data layer.
 */

// ---------------------------------------------------------------------------
// Metadata shared by manual pages and materials
// ---------------------------------------------------------------------------
export interface SeoData {
  title: string;
  description: string;
  image: string | null;
  noIndex: boolean;
}

export interface LlmData {
  description: string;
  notes: string[];
  exclude: boolean;
}

// ---------------------------------------------------------------------------
// Manual version (one RuleSet)
// ---------------------------------------------------------------------------
export interface ExternalIdentifier {
  platform: string;
  externalId: string;
  url: string | null;
}

export interface ManualVersion {
  slug: string;
  name: string;
  description: string;
  isDefault: boolean;
  /** Slug of the previous edition (only set on subsequent versions, e.g. the beta). */
  predecessor: string | null;
  /** schema.org release status (e.g. "Published", "Draft"). */
  creativeWorkStatus: string;
  /** URL of the version's site page (optional). */
  url: string | null;
  /** External references (Wikipedia, Wikidata, RPGGeek, ...). */
  externalIdentifiers: ExternalIdentifier[];
}

// ---------------------------------------------------------------------------
// Licenses
// ---------------------------------------------------------------------------
export interface License {
  slug: string;
  name: string;
  label: string;
  url: string | null;
}

export interface MaterialLicense {
  licenseSlug: string;
  licenseName: string;
  licenseUrl: string | null;
  scope: string;
}

// ---------------------------------------------------------------------------
// Manual pages
// ---------------------------------------------------------------------------
export interface ManualPage {
  /** Slugs relative to the manual root (e.g. [] for the index page, ['game-master', 'gm']) */
  slugs: string[];
  /** Keystatic entry slug, e.g. `1.0/game-master/gm` */
  entrySlug: string;
  title: string;
  summary: string;
  /**
   * Cover image, as a path relative to the entry directory (keystatic
   * `fields.image`); resolve against `/files/manuale/pagine/<entrySlug>/`.
   */
  image: string | null;
  /** MarkDoc body as a lazy AST accessor. */
  content: () => Promise<MarkdocNode>;
  /** Licenses referenced by the page */
  licenses: MaterialLicense[];
  seo: SeoData;
  llm: LlmData;
}

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------
export interface MaterialAsset {
  type: "file" | "external";
  name: string;
  /** File name inside the entry dir (file assets) */
  file: string | null;
  /** External URL (external assets) */
  url: string | null;
  thumbnail: string | null;
}

export interface MaterialCredit {
  authorSlug: string;
  authorName: string;
  /** Whether the author can appear among the materials filter options. */
  authorFiltrable: boolean;
  kind: string;
  url: string | null;
}

export interface ContainedMaterial {
  /** Entry slug (version-prefixed) */
  entrySlug: string;
  /** Version-free slug, for building the detail URL */
  slug: string;
  name: string;
}

export interface Material {
  slug: string;
  /** Slugs relative to the materials root (e.g. ['barbaro']) */
  slugs: string[];
  name: string;
  version: string;
  type: string;
  source: string;
  summary: string;
  flavor: string;
  /** Public URL of the 1:1 card thumbnail (from the `thumbnail` field) */
  thumbnail: string | null;
  /** The collection this material belongs to, resolved from the collection
   *  materials' `contains` lists (single source of truth). */
  collection: { slug: string; name: string } | null;
  date: string | null;
  licenses: MaterialLicense[];
  /** Materials contained by this material (only for type "collection") */
  contains: ContainedMaterial[];
  showcase: { image: string | null; heroName: string | null } | null;
  credits: MaterialCredit[];
  assets: MaterialAsset[];
  /** MarkDoc body as a lazy AST accessor (empty document when absent). */
  content: () => Promise<MarkdocNode>;
  seo: SeoData;
  llm: LlmData;
}

// ---------------------------------------------------------------------------
// Authors and site settings (global, not version-scoped)
// ---------------------------------------------------------------------------
export interface Author {
  slug: string;
  completeName: string;
  /** Whether the author can appear among the materials filter options. */
  filtrable: boolean;
  avatar: string | null;
  urls: Record<string, string | null>;
}

export interface SiteSettings {
  title: string;
  description: string;
  donateUrl: string | null;
  githubUrl: string | null;
  originalGameUrl: string | null;
  licenseSlug: string | null;
}

// ---------------------------------------------------------------------------
// RuleSet aggregate root
// ---------------------------------------------------------------------------
export interface ManualNavItem {
  group: string;
}

export type ManualNavItemUnion =
  | ({ type: "page"; page: ManualPage } & ManualNavItem)
  | ({ type: "url"; label: string; url: string } & ManualNavItem);

export interface ManualNavGroup {
  groupName: string | null;
  items: ManualNavItemUnion[];
}

/**
 * The aggregate root: a manual version (a rule set) with its navigation,
 * all its pages (nav-referenced or orphan drafts), its materials and the
 * content license declared in the site settings.
 */
export interface RuleSet {
  version: ManualVersion;
  manual: ManualNavGroup[];
  /** Every page of the version, nav-referenced or not. */
  pages: ManualPage[];
  materials: Material[];
  license: License | null;
}
