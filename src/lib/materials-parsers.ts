import { parseAsArrayOf, parseAsBoolean, parseAsInteger, parseAsString } from "nuqs/server";

export const materialsParsers = {
  search: parseAsString.withDefault(""),
  type: parseAsArrayOf(parseAsString, ",").withDefault([]),
  source: parseAsArrayOf(parseAsString, ",").withDefault([]),
  authors: parseAsArrayOf(parseAsString, ",").withDefault([]),
  licenses: parseAsArrayOf(parseAsString, ",").withDefault([]),
  excludeAi: parseAsBoolean.withDefault(false),
  page: parseAsInteger.withDefault(1),
};

export const MATERIALS_PAGE_SIZE = 12;

export const MATERIAL_TYPE_OPTIONS = [
  { label: "Classe", value: "class" },
  { label: "Campagna", value: "campaign" },
  { label: "Approfondimento", value: "insight" },
  { label: "Ambientazione", value: "setting" },
  { label: "Mostro", value: "monster" },
  { label: "Equipaggiamento", value: "equipment" },
  { label: "Collezione", value: "collection" },
] as const;

export const MATERIAL_SOURCE_OPTIONS = [
  { label: "Ufficiale", value: "official" },
  { label: "Homebrew", value: "homebrew" },
] as const;

// Target of a license entry: what part of the material/document it applies to.
// Kept in sync with LICENSE_SCOPE_OPTIONS in keystatic.config.ts.
export const LICENSE_SCOPE_OPTIONS = [
  { label: "Tutto il contenuto", value: "tutto" },
  { label: "Contenuti testuali", value: "testo" },
  { label: "Traduzione", value: "traduzione" },
  { label: "Prefazioni, postfazioni e saggi", value: "testi-secondari" },
  { label: "Snippet di codice", value: "codice" },
  { label: "Immagini interne (foto, illustrazioni, grafici)", value: "immagini" },
  { label: "Copertina", value: "copertina" },
  { label: "Design e impaginazione", value: "layout" },
  { label: "Font incorporati", value: "font" },
  { label: "Script e interattività", value: "script" },
  { label: "Dataset", value: "dati" },
] as const;

export function licenseScopeLabel(scope: string): string {
  return (
    LICENSE_SCOPE_OPTIONS.find((o) => o.value === scope)?.label ?? scope
  );
}