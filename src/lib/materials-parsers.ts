import { parseAsArrayOf, parseAsInteger, parseAsString } from "nuqs/server";
 
import { LICENSE_SCOPE_OPTIONS } from "../../keystatic.config";

export const materialsParsers = {
  search: parseAsString.withDefault(""),
  type: parseAsArrayOf(parseAsString, ",").withDefault([]),
  source: parseAsArrayOf(parseAsString, ",").withDefault([]),
  authors: parseAsArrayOf(parseAsString, ",").withDefault([]),
  licenses: parseAsArrayOf(parseAsString, ",").withDefault([]),
  page: parseAsInteger.withDefault(1),
};

export const MATERIALS_PAGE_SIZE = 12;

export function licenseScopeLabel(scope: string): string {
  return (
    LICENSE_SCOPE_OPTIONS.find((o) => o.value === scope)?.label ?? scope
  );
}