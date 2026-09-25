/**
 * One-shot migration: derive `navGroups` for every version entry from the
 * legacy sources (folder structure + meta.json + the per-page `order` field).
 *
 * Mapping (flat, no subgroups):
 * - top-level folders  -> navGroups entries (groupName from meta.json title)
 * - pages inside them  -> `page` items with status "default"; deeper folders
 *   are flattened into the same navGroup (order-preserving walk)
 * - root loose pages   -> a leading navGroup with an empty groupName
 *
 * Item order follows the meta.json `pages` arrays (what the site actually
 * rendered); pages missing from meta.json are appended, sorted by `order`.
 *
 * Run with: pnpm exec tsx scripts/generate-nav-groups.ts
 * The script only ADDS the navGroups key to the version entries under
 * docs/manuale/versioni; the legacy sources (order field, meta.json) are
 * left untouched for review.
 */
import { statSync } from "node:fs";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse, stringify } from "yaml";

const ROOT = process.cwd();
const VERSIONS_DIR = path.join(ROOT, "docs", "manuale", "versioni");
const PAGES_DIR = path.join(ROOT, "docs", "manuale", "pagine");

interface NavLeaf {
  discriminant: "page" | "url";
  value: Record<string, unknown>;
}
type NavItem = NavLeaf;
interface NavGroup {
  groupName: string;
  items: NavItem[];
}

async function readMetaJson(dir: string): Promise<{ pages?: string[]; title?: string } | null> {
  try {
    return JSON.parse(await readFile(path.join(dir, "meta.json"), "utf8"));
  } catch {
    return null;
  }
}

async function readOrderField(pageDir: string): Promise<number> {
  try {
    const raw = await readFile(path.join(pageDir, "index.mdoc"), "utf8");
    const m = raw.match(/^order:\s*(\d+)\s*$/m);
    return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}

async function isPage(dir: string): Promise<boolean> {
  try {
    return (await stat(path.join(dir, "index.mdoc"))).isFile();
  } catch {
    return false;
  }
}

/** Entries of `dir` in sidebar order: meta.json list first, unlisted pages appended (sorted by `order`). */
async function orderedEntries(dir: string): Promise<{ name: string; isDirEntry: boolean }[]> {
  const meta = await readMetaJson(dir);
  const listed = meta?.pages ?? [];
  const listedSet = new Set(listed);

  const entries = await readdir(dir, { withFileTypes: true });
  const extra: string[] = [];
  for (const e of entries) {
    if (!e.isDirectory() || listedSet.has(e.name)) continue;
    extra.push(e.name);
  }
  const withOrder = await Promise.all(
    extra.map(async (name) => ({
      name,
      order: (await isPage(path.join(dir, name)))
        ? await readOrderField(path.join(dir, name))
        : Number.MAX_SAFE_INTEGER,
    })),
  );
  withOrder.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  return [
    ...listed
      .filter((name) => {
        try {
          return statSync(path.join(dir, name)).isDirectory();
        } catch {
          console.warn(`  [skip] ${path.relative(PAGES_DIR, path.join(dir, name))}: non esiste (meta.json stantano)`);
          return false;
        }
      })
      .map((name) => ({ name, isDirEntry: true })),
    ...withOrder.map((e) => ({ name: e.name, isDirEntry: true })),
  ];
}

function pageItem(version: string, relSlug: string): NavLeaf {
  return {
    discriminant: "page",
    value: { page: `${version}/${relSlug}`, status: "default" },
  };
}

/** Pages of `dir` and its subfolders, flattened in sidebar order (meta.json lists first, unlisted appended by `order`). */
async function collectLeafPages(version: string, dir: string, relBase: string): Promise<NavItem[]> {
  const items: NavItem[] = [];
  for (const { name } of await orderedEntries(dir)) {
    const childDir = path.join(dir, name);
    const childRel = relBase ? `${relBase}/${name}` : name;
    if (await isPage(childDir)) {
      items.push(pageItem(version, childRel));
      continue;
    }
    // nested folder: flatten its pages into the same navGroup
    items.push(...(await collectLeafPages(version, childDir, childRel)));
  }
  return items;
}

async function buildNavGroups(version: string): Promise<NavGroup[]> {
  const pagesDir = path.join(PAGES_DIR, version);
  await stat(pagesDir); // throws if the version has no pages

  const groups: NavGroup[] = [];
  for (const { name } of await orderedEntries(pagesDir)) {
    const childDir = path.join(pagesDir, name);
    if (await isPage(childDir)) {
      // root loose page: goes into the leading unnamed group
      let root = groups[0];
      if (!root || root.groupName !== "") {
        root = { groupName: "", items: [] };
        groups.unshift(root);
      }
      root.items.push(pageItem(version, name));
      continue;
    }
    // top-level folder -> its own navGroup (nested folders flattened inside)
    groups.push({
      groupName: (await readMetaJson(childDir))?.title ?? name,
      items: await collectLeafPages(version, childDir, name),
    });
  }
  return groups;
}

function countItems(items: NavItem[]): number {
  return items.length;
}

async function migrateVersion(version: string) {
  const entryPath = path.join(VERSIONS_DIR, version, "index.yaml");
  let navGroups: NavGroup[] = [];
  try {
    navGroups = await buildNavGroups(version);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      console.log(`- ${version}: nessuna pagina`);
    } else {
      throw e;
    }
  }

  const raw = await readFile(entryPath, "utf8");
  const entry = parse(raw) as Record<string, unknown>;
  entry.navGroups = navGroups;
  await writeFile(entryPath, stringify(entry, { lineWidth: 0 }), "utf8");

  const total = navGroups.reduce((acc, g) => acc + countItems(g.items), 0);
  console.log(
    `- ${version}: ${navGroups.length} navGroups (${navGroups
      .map((g) => `"${g.groupName || "°"}"×${g.items.length}`)
      .join(", ")}), ${total} voci pagina`,
  );
}

async function main() {
  const versions = (await readdir(VERSIONS_DIR, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  console.log(`Versioni: ${versions.join(", ")}\n`);
  for (const v of versions) {
    await migrateVersion(v);
  }
  console.log("\nFatto. I sorgenti legacy (campo order, meta.json) sono intatti.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
