"use client";

import { useEffect, useState } from "react";
import { useQueryStates } from "nuqs";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { materialsParsers } from "@/lib/materials-parsers";

export function MaterialsSearchInput() {
  const [{ search }, setQuery] = useQueryStates(materialsParsers, {
    shallow: false,
  });
  const [value, setValue] = useState(search);

  // keep the local value in sync when the URL changes externally
  useEffect(() => setValue(search), [search]);

  // debounce URL updates while typing
  useEffect(() => {
    const t = setTimeout(() => {
      if (value !== search) void setQuery({ search: value || null, page: null });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cerca un materiale…"
        aria-label="Cerca un materiale"
        className="pl-9 pr-9"
      />
      {value ? (
        <button
          type="button"
          aria-label="Cancella ricerca"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => {
            setValue("");
            void setQuery({ search: null, page: null });
          }}
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
