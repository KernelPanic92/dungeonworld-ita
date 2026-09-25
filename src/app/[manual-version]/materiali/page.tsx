import { notFound } from "next/navigation";
import {
  getLicenses,
  getManualVersions,
  getMaterials,
  isValidManualVersion,
} from "@/lib/keystatic";
import { materialsCache } from "@/lib/materials-query";
import {
  MATERIALS_PAGE_SIZE,
  MATERIAL_SOURCE_OPTIONS,
  MATERIAL_TYPE_OPTIONS,
} from "@/lib/materials-parsers";
import { filterMaterials, paginate, sortMaterials } from "@/lib/materials";
import { MaterialsSearchInput } from "@/components/materials/materials-search-input";
import { MaterialsFilterDrawer } from "@/components/materials/materials-filter-drawer";
import { MaterialsFilters, type FilterAuthor, type FilterLicense, type FilterOption } from "@/components/materials/materials-filters";
import { MaterialCard } from "@/components/materials/material-card";
import { MaterialsPagination } from "@/components/materials/materials-pagination";
import { VersionSwitcher } from "@/components/site/version-switcher";
import { PackageSearch } from "lucide-react";

export const metadata = {
  title: "Materiali",
  description:
    "Materiali ufficiali e homebrew per Dungeon World: classi, campagne, mostri, ambientazioni, approfondimenti e collezioni in italiano.",
};

interface Props {
  params: Promise<{ "manual-version": string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MaterialsPage({ params, searchParams }: Props) {
  const { "manual-version": version } = await params;
  if (!(await isValidManualVersion(version))) notFound();

  const query = materialsCache.parse(await searchParams);

  const [all, versions, licenses] = await Promise.all([
    getMaterials(version),
    getManualVersions(),
    getLicenses(),
  ]);

  // Filter options reflect the values actually used by this version.
  const usedTypes = new Set(all.map((m) => m.type));
  const typeOptions: FilterOption[] = MATERIAL_TYPE_OPTIONS.filter((o) =>
    usedTypes.has(o.value),
  ).map((o) => ({ label: o.label, value: o.value }));
  const usedSources = new Set(all.map((m) => m.source));
  const sourceOptions: FilterOption[] = MATERIAL_SOURCE_OPTIONS.filter((o) =>
    usedSources.has(o.value),
  ).map((o) => ({ label: o.label, value: o.value }));

  // Author filter options: anyone with a credit on a material of this
  // version whose author entry is marked filtrable.
  const authorOptions: FilterAuthor[] = [
    ...new Map(
      all
        .flatMap((m) => m.credits)
        .filter((c) => c.authorSlug && c.authorFiltrable)
        .map((c) => [c.authorSlug, c.authorName || c.authorSlug] as const),
    ).entries(),
  ]
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "it"));

  // License filter options: licenses actually referenced by this version.
  const usedLicenseSlugs = new Set(
    all.flatMap((m) => m.licenses).map((l) => l.licenseSlug),
  );
  const licenseOptions: FilterLicense[] = licenses
    .filter((l) => usedLicenseSlugs.has(l.slug))
    .map((l) => ({ slug: l.slug, label: l.label }))
    .sort((a, b) => a.label.localeCompare(b.label, "it"));

  const hasActiveQuery =
    query.search.trim().length > 0 ||
    query.type.length > 0 ||
    query.source.length > 0 ||
    query.authors.length > 0 ||
    query.licenses.length > 0;
  const filtered = filterMaterials(all, query);
  const sorted = sortMaterials(filtered, hasActiveQuery);
  const { items, pageCount } = paginate(
    sorted,
    query.page,
    MATERIALS_PAGE_SIZE,
  );

  const versionOptions = versions.map((v) => ({
    slug: v.slug,
    name: v.name,
    isDefault: v.isDefault,
  }));

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Materiali
        </h1>
        <p className="mt-2 text-muted-foreground">
          Plasma la tua prossima avventura con i contenuti ufficiali e le creazioni della community.
        </p>
      </header>

      <div className="mb-6 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <MaterialsSearchInput />
        </div>
        <MaterialsFilterDrawer
          version={version}
          versions={versionOptions}
          types={typeOptions}
          sources={sourceOptions}
          authors={authorOptions}
          licenses={licenseOptions}
        />
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-lg border bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3 border-b pb-4">
              <VersionSwitcher current={version} versions={versionOptions} />
            </div>
            <MaterialsFilters
              types={typeOptions}
              sources={sourceOptions}
              authors={authorOptions}
              licenses={licenseOptions}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {items.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((m) => (
                <MaterialCard key={m.slug} material={m} version={version} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-20 text-center">
              <PackageSearch className="size-10 text-muted-foreground" />
              <p className="font-medium">Nessun materiale trovato</p>
              <p className="text-sm text-muted-foreground">
                Prova a modificare ricerca o filtri.
              </p>
            </div>
          )}

          <MaterialsPagination pageCount={pageCount} />
        </div>
      </div>
    </div>
  );
}