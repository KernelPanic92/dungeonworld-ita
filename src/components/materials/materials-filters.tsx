"use client";

import { useQueryStates } from "nuqs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { MATERIAL_SOURCE_OPTIONS, MATERIAL_TYPE_OPTIONS } from "@/lib/materials-parsers";
import { materialsParsers } from "@/lib/materials-parsers";

export function MaterialsFilters() {
  const [{ type, source }, setQuery] = useQueryStates(materialsParsers, {
    shallow: false,
  });

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const hasFilters = type.length > 0 || source.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filtri</h2>
        {hasFilters ? (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-dw"
            onClick={() => void setQuery({ type: null, source: null, page: null })}
          >
            Azzera
          </button>
        ) : null}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Tipo
        </p>
        <div className="flex flex-col gap-2">
          {MATERIAL_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={type.includes(option.value)}
                onCheckedChange={() =>
                  void setQuery({ type: toggle(type, option.value), page: null })
                }
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Provenienza
        </p>
        <div className="flex flex-col gap-2">
          {MATERIAL_SOURCE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={source.includes(option.value)}
                onCheckedChange={() =>
                  void setQuery({ source: toggle(source, option.value), page: null })
                }
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
