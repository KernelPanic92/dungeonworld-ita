"use client";

import { useQueryStates } from "nuqs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { materialsParsers } from "@/lib/materials-parsers";

export function MaterialsPagination({ pageCount }: { pageCount: number }) {
  const [{ page }, setQuery] = useQueryStates(materialsParsers, {
    shallow: false,
  });

  if (pageCount <= 1) return null;

  const go = (p: number) => void setQuery({ page: p });

  // sliding window of at most 5 page numbers around the current one
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const pages = Array.from(
    { length: Math.min(5, pageCount) },
    (_, i) => start + i,
  );

  return (
    <Pagination className="mt-10">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) go(page - 1);
            }}
          >
            Precedente
          </PaginationPrevious>
        </PaginationItem>
        {pages.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              href="#"
              isActive={p === page}
              onClick={(e) => {
                e.preventDefault();
                go(p);
              }}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={page >= pageCount}
            className={page >= pageCount ? "pointer-events-none opacity-50" : undefined}
            onClick={(e) => {
              e.preventDefault();
              if (page < pageCount) go(page + 1);
            }}
          >
            Successiva
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
