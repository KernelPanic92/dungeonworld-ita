import { dynamicLoader } from "fumadocs-core/source";
import type * as PageTree from "fumadocs-core/page-tree";
import ruleSetRepository, { manualBaseUrl } from "@/lib/content";
import type { RuleSet } from "@/lib/content/models";
import manualSourceProvider from "@/lib/content/manual-source-provider";

export { manualBaseUrl };

/**
 * One Fumadocs source covering every version, used by the search endpoint
 * (`createFromSource`). Only nav-referenced pages are indexed (orphan drafts
 * stay out of search), and each page is tagged with its version so the
 * client can scope results to the current version.
 */
let searchSource: Awaited<ReturnType<typeof buildManualSearchSource>> | undefined;

async function buildManualSearchSource() {
  const source = await manualSourceProvider.build();
  const loader = dynamicLoader(source, { baseUrl: "/manuale" });
  return loader.get();
}

export async function getManualSearchSource() {
  searchSource ??= await buildManualSearchSource();
  return searchSource;
}

/**
 * Builds the Fumadocs page tree with one root folder per manual version
 * (same root type, so fumadocs renders them as interchangeable tabs).
 * Each folder's children come from the version's navGroups; pages not in
 * navGroups (orphans) are absent from the tree: no sidebar entry, no
 * breadcrumb, no highlight.
 * The version index page stays a child item (the sidebar's layout tabs
 * only consider folder children to decide whether the version switcher is
 * active), while the folder's `index` keeps pointing at it so the switcher
 * and the structural projection fall back to it.
 * A version without nav pages still gets a folder with just an index
 * (the landing page rendered from the version entry), so every version
 * shows up in the switcher and is reachable by URL.
 */
export async function getManualPageTree(): Promise<PageTree.Root> {
  const [ruleSets, defaultVersion] = await Promise.all([
    ruleSetRepository.findAll(),
    ruleSetRepository.getDefaultVersion(),
  ]);

  const folders: PageTree.Folder[] = [];
  for (const ruleSet of ruleSets) {
    folders.push(folderOf(ruleSet, defaultVersion));
  }

  return {
    type: "root",
    name: "Manuale",
    children: folders,
  };
}

function folderOf(ruleSet: RuleSet, defaultVersion: string): PageTree.Folder {
  const version = ruleSet.version.slug;
  const baseUrl = manualBaseUrl(version, defaultVersion);

  type Entry = { node: PageTree.Item; group: string };
  const entries: Entry[] = [];

  for (const group of ruleSet.manual) {
    const groupName = group.groupName ?? "";
    for (const item of group.items) {
      if (item.type === "url") {
        entries.push({
          group: groupName,
          node: {
            type: "page",
            name: item.label,
            url: item.url,
            external: true,
          },
        });
        continue;
      }
      const rest = item.page.entrySlug.slice(version.length + 1);
      entries.push({
        group: groupName,
        node: {
          type: "page",
          name: item.page.title,
          url: rest === "index" ? baseUrl : `${baseUrl}/${rest}`,
        },
      });
    }
  }

  const groups = new Map<string, PageTree.Item[]>();
  const rootChildren: PageTree.Item[] = [];

  for (const { group, node } of entries) {
    if (group === "") {
      rootChildren.push(node);
    } else {
      const items = groups.get(group);
      if (items) items.push(node);
      else groups.set(group, [node]);
    }
  }

  return {
    type: "folder",
    name: ruleSet.version.name,
    root: "version",
    index: { type: "page", name: ruleSet.version.name, url: baseUrl },
    children: [
      ...rootChildren,
      ...[...groups.entries()].map(([name, children]) => ({
        type: "folder" as const,
        name,
        children,
      })),
    ],
  };
}
