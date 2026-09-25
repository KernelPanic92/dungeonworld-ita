import { notFound } from "next/navigation";
import { getMaterials, isValidManualVersion } from "@/lib/keystatic";
import { materialsCache } from "@/lib/materials-query";
import { MATERIALS_PAGE_SIZE } from "@/lib/materials-parsers";
import { filterMaterials, paginate, sortMaterials } from "@/lib/materials";
import { MaterialsSearchInput } from "@/components/materials/materials-search-input";
import { MaterialsFilterDrawer } from "@/components/materials/materials-filter-drawer";
import { MaterialsFilters } from "@/components/materials/materials-filters";
import { MaterialCard } from "@/components/materials/material-card";
import { MaterialsPagination } from "@/components/materials/materials-pagination";
import { PackageSearch } from "lucide-react";

export const metadata = {
  title: "Materiali",
  description:
    "Materiali ufficiali e homebrew per Dungeon World: classi, campagne, mostri, ambientazioni e approfondimenti in italiano.",
};

interface Props {
  params: Promise<{ "manual-version": string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MaterialsPage({ params, searchParams }: Props) {
  const { "manual-version": version } = await params;
  if (!(await isValidManualVersion(version))) notFound();

  const query = materialsCache.parse(await searchParams);

  const all = await getMaterials(version);
  const hasActiveQuery =
    query.search.trim().length > 0 || query.type.length > 0 || query.source.length > 0;
  const filtered = filterMaterials(all, query);
  const sorted = sortMaterials(filtered, hasActiveQuery);
  const { items, page, pageCount, total } = paginate(
    sorted,
    query.page,
    MATERIALS_PAGE_SIZE,
  );

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Materiali
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {total} materiali per la versione {version} del manuale: classi,
          campagne, mostri, ambientazioni e approfondimenti ufficiali e
          homebrew.
        </p>
      </header>

      <div className="mb-8 flex items-center gap-3">
        <div className="max-w-xl flex-1">
          <MaterialsSearchInput />
        </div>
        <MaterialsFilterDrawer />
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-lg border bg-card p-5">
            <MaterialsFilters />
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