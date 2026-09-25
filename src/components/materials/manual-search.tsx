"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import DefaultSearchDialog from "fumadocs-ui/components/dialog/search-default";

export function ManualSearch({ version }: { version: string }) {
  const [open, setOpen] = useState(false);
  const api = `/${version}/manuale/search`;

  return (
    <>
      <button
        type="button"
        className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Cerca nel manuale…</span>
        <span className="hidden md:inline text-xs border rounded px-1.5 py-0.5">
          ⌘K
        </span>
      </button>
      <DefaultSearchDialog
        open={open}
        onOpenChange={setOpen}
        api={api}
      />
    </>
  );
}