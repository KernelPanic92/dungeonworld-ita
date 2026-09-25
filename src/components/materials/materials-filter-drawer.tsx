"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { VersionSwitcher, type VersionOption } from "@/components/site/version-switcher";
import { MaterialsFilters, type FilterAuthor, type FilterLicense, type FilterOption } from "./materials-filters";

export function MaterialsFilterDrawer({
  version,
  versions,
  types,
  sources,
  authors,
  licenses,
}: {
  version: string;
  versions: VersionOption[];
  types: FilterOption[];
  sources: FilterOption[];
  authors: FilterAuthor[];
  licenses: FilterLicense[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        render={
          <Button variant="outline" className="gap-2 lg:hidden">
            <SlidersHorizontal className="size-4" />
            Filtri
          </Button>
        }
      />
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Filtri</DrawerTitle>
          <DrawerDescription>Affina la ricerca dei materiali.</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 px-4 pb-6">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Versione del manuale</span>
            <VersionSwitcher current={version} versions={versions} />
          </div>
          <MaterialsFilters
            types={types}
            sources={sources}
            authors={authors}
            licenses={licenses}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}