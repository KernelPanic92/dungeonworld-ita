"use client";

import { SearchProvider } from "fumadocs-ui/contexts/search";
import type { DefaultSearchDialogProps } from "fumadocs-ui/components/dialog/search-default";
import type { ManualVersion } from "@/lib/keystatic";

interface Props {
  /** Current version: the search dialog's default tag. */
  version: string;
  versions: ManualVersion[];
  children: React.ReactNode;
}

/**
 * Enables the built-in fumadocs search within the manual, scoped to the
 * current version by default (the tag is preselected on the current
 * version; users can switch to another version from the tags list, but the
 * results are never a blanket mix of every version).
 */
export function ManualSearchProvider({ version, versions, children }: Props) {
  return (
    <SearchProvider
      options={
        {
          allowClear: true,
          api: `/manuale/search`,
          type: "static",
          defaultTag: version,
        } as Partial<DefaultSearchDialogProps>
      }
    >
      {children}
    </SearchProvider>
  );
}