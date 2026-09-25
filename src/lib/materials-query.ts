import { createSearchParamsCache, createSerializer } from "nuqs/server";
import { materialsParsers } from "./materials-parsers";

export const materialsCache = createSearchParamsCache(materialsParsers);
export const serializeMaterials = createSerializer(materialsParsers);
