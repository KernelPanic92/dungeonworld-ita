import type { Material } from "./keystatic";

export interface MaterialsQuery {
  search: string;
  type: string[];
  source: string[];
  authors: string[];
  licenses: string[];
  page: number;
}

export function filterMaterials(materials: Material[], query: Omit<MaterialsQuery, "page">) {
  const q = query.search.trim().toLowerCase();
  return materials.filter((m) => {
    if (query.type.length > 0 && !query.type.includes(m.type)) return false;
    if (query.source.length > 0 && !query.source.includes(m.source)) return false;
    if (query.authors.length > 0) {
      if (!m.credits.some((c) => query.authors.includes(c.authorSlug))) return false;
    }
    if (query.licenses.length > 0) {
      if (!m.licenses.some((l) => query.licenses.includes(l.licenseSlug))) return false;
    }
    if (q) {
      const haystack = [
        m.name,
        m.flavor,
        m.summary,
        m.collection?.name ?? "",
        ...m.credits.map((c) => c.authorName),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function sortMaterials(materials: Material[], hasActiveQuery: boolean) {
  const byName = (a: Material, b: Material) => a.name.localeCompare(b.name, "it");
  if (hasActiveQuery) {
    // with an active search/filter: most recent first, then name
    return [...materials].sort((a, b) => {
      const dateA = a.date ?? "";
      const dateB = b.date ?? "";
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return byName(a, b);
    });
  }
  // default view: official first, then name
  return [...materials].sort((a, b) => {
    if (a.source !== b.source) return a.source === "official" ? -1 : 1;
    return byName(a, b);
  });
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  return {
    items: items.slice((safePage - 1) * pageSize, safePage * pageSize),
    page: safePage,
    pageCount,
    total,
  };
}

export function materialThumbnail(m: Material, version: string): string | null {
  if (m.showcase?.image) {
    return `/files/materiali/${version}/${m.slug}/${m.showcase.image}`;
  }
  const firstWithThumb = m.assets.find((a) => a.thumbnail);
  if (firstWithThumb?.thumbnail) {
    return firstWithThumb.type === "file"
      ? `/files/materiali/${version}/${m.slug}/${firstWithThumb.thumbnail}`
      : firstWithThumb.thumbnail;
  }
  return null;
}

export function materialFileUrl(m: Material, version: string, fileName: string) {
  return `/files/materiali/${version}/${m.slug}/${fileName}`;
}
