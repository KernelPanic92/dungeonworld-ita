import { getManualSearchSource } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

// statically cached: content is static per deployment
export const revalidate = false;

// The unified source is memoised, so this server is built once. Each page is
// tagged with its version; the search dialog scopes results to the current
// version via the `tag` query option.
export const { staticGET: GET } = createFromSource(getManualSearchSource, {
  buildIndex: (page) => ({
    id: page.data.url,
    title: page.data.title,
    description: page.data.description,
    url: page.data.url,
    structuredData: page.data.structuredData,
    tag: page.data.version,
    breadcrumbs: page.data.group
      ? ["Manuale", page.data.versionName, page.data.group]
      : ["Manuale", page.data.versionName],
  }),
});