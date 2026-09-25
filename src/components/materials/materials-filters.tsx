"use client";

import { useQueryStates } from "nuqs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  materialsParsers,
} from "@/lib/materials-parsers";

export interface FilterAuthor {
  slug: string;
  name: string;
}

export interface FilterLicense {
  slug: string;
  label: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

// all groups start collapsed
const DEFAULT_OPEN: string[] = [];

function ActiveCount({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="inline-flex size-5 items-center justify-center rounded-full bg-dw text-xs font-semibold text-on-dw">
      {count}
    </span>
  );
}

export function MaterialsFilters({
  types,
  sources,
  authors,
  licenses,
}: {
  /** Values actually used by materials of the selected version. */
  types: FilterOption[];
  sources: FilterOption[];
  authors: FilterAuthor[];
  licenses: FilterLicense[];
}) {
  const [
    {
      type,
      source,
      authors: selectedAuthors,
      licenses: selectedLicenses,
      excludeAi,
    },
    setQuery,
  ] = useQueryStates(materialsParsers, { shallow: false });

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const hasFilters =
    type.length > 0 ||
    source.length > 0 ||
    selectedAuthors.length > 0 ||
    selectedLicenses.length > 0 ||
    excludeAi;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filtri</h2>
        {hasFilters ? (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-dw"
            onClick={() =>
              void setQuery({
                type: null,
                source: null,
                authors: null,
                licenses: null,
                excludeAi: null,
                page: null,
              })
            }
          >
            Azzera
          </button>
        ) : null}
      </div>

      <Accordion defaultValue={DEFAULT_OPEN}>
        <AccordionItem value="tipo">
          <AccordionTrigger className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span className="flex items-center gap-2">
              Tipo
              <ActiveCount count={type.length} />
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2">
              {types.map((option) => (
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
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="provenienza">
          <AccordionTrigger className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span className="flex items-center gap-2">
              Provenienza
              <ActiveCount count={source.length} />
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2">
              {sources.map((option) => (
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
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="autori">
          <AccordionTrigger className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span className="flex items-center gap-2">
              Autori
              <ActiveCount count={selectedAuthors.length + (excludeAi ? 1 : 0)} />
            </span>
          </AccordionTrigger>
          <AccordionContent>
            {authors.length > 0 ? (
              <div className="flex flex-col gap-2">
                {authors.map((author) => (
                  <label
                    key={author.slug}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={selectedAuthors.includes(author.slug)}
                      onCheckedChange={() =>
                        void setQuery({
                          authors: toggle(selectedAuthors, author.slug),
                          page: null,
                        })
                      }
                    />
                    {author.name}
                  </label>
                ))}
                {/* the AI illustrator is not a filter option, only an exclusion */}
                <label className="flex cursor-pointer items-center gap-2 border-t pt-3 text-sm">
                  <Checkbox
                    checked={excludeAi}
                    onCheckedChange={() =>
                      void setQuery({ excludeAi: !excludeAi, page: null })
                    }
                  />
                  Escludi immagini AI (DeepAI)
                </label>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nessun autore.</p>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="licenze">
          <AccordionTrigger className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span className="flex items-center gap-2">
              Licenze
              <ActiveCount count={selectedLicenses.length} />
            </span>
          </AccordionTrigger>
          <AccordionContent>
            {licenses.length > 0 ? (
              <div className="flex flex-col gap-2">
                {licenses.map((license) => (
                  <label
                    key={license.slug}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={selectedLicenses.includes(license.slug)}
                      onCheckedChange={() =>
                        void setQuery({
                          licenses: toggle(selectedLicenses, license.slug),
                          page: null,
                        })
                      }
                    />
                    {license.label}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nessuna licenza.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}