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
import { MaterialsFilters } from "./materials-filters";

export function MaterialsFilterDrawer() {
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
        <div className="px-4 pb-6">
          <MaterialsFilters />
        </div>
      </DrawerContent>
    </Drawer>
  );
}