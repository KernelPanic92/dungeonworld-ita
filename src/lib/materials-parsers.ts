import { parseAsArrayOf, parseAsInteger, parseAsString } from "nuqs/server";

export const materialsParsers = {
  search: parseAsString.withDefault(""),
  type: parseAsArrayOf(parseAsString, ",").withDefault([]),
  source: parseAsArrayOf(parseAsString, ",").withDefault([]),
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
] as const;

export const MATERIAL_SOURCE_OPTIONS = [
  { label: "Ufficiale", value: "official" },
  { label: "Homebrew", value: "homebrew" },
] as const;
