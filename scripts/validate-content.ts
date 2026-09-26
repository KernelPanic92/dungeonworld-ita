/**
 * Build-time content validator (run as part of `pnpm build`).
 *
 * The version prefix in a page slug is a hand-typed foreign key that the
 * Keystatic schema cannot enforce, and a relationship field stores a plain
 * string (deleting a page does not remove nav items). This validator blocks
 * the build on inconsistencies.
 *
 * Errors (build fails):
 * - page slug without a version prefix
 * - page slug whose first segment is not an existing version
 * - nav item referencing a nonexistent page
 * - nav item referencing a page of another version
 * - duplicate page entries in the same navGroup
 * - number of versions marked as current (isDefault) is not exactly 1
 *
 * Warnings (build continues):
 * - pages not referenced in any navGroups of their version (orphans)
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";

const ROOT = process.cwd();
const VERSIONS_DIR = path.join(ROOT, "docs", "manuale", "versioni");
const PAGES_DIR = path.join(ROOT, "docs", "manuale", "pagine");
const MATERIALS_DIR = path.join(ROOT, "docs", "materiali");
const LICENSES_DIR = path.join(ROOT, "docs", "licenze");

const errors: string[] = [];
const warnings: string[] = [];

async function existsPage(version: string, rest: string) {
  try {
    await stat(path.join(PAGES_DIR, version, rest, "index.mdoc"));
    return true;
  } catch {
    return false;
  }
}

async function existsMaterial(entrySlug: string) {
  try {
    await stat(path.join(MATERIALS_DIR, entrySlug, "index.mdoc"));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const versions = (await readdir(VERSIONS_DIR, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  const versionSet = new Set(versions);

  // --- versions ---
  const defaultVersions: string[] = [];
  // referenced page slugs per version, e.g. Map<"1.0", Set<"1.0/index">>
  const referenced = new Map<string, Set<string>>();

  for (const version of versions) {
    const refSet = new Set<string>();
    referenced.set(version, refSet);

    let entry: {
      isDefault?: boolean;
      navGroups?: Array<{
        groupName?: string;
        items?: Array<{ discriminant: string; value?: { page?: string; label?: string; url?: string } }>;
      }>;
    };
    try {
      entry = parse(await readFile(path.join(VERSIONS_DIR, version, "index.yaml"), "utf8"));
    } catch (e) {
      errors.push(`versione ${version}: index.yaml non leggibile (${(e as Error).message})`);
      continue;
    }

    if (entry.isDefault) defaultVersions.push(version);

    const navGroups = entry.navGroups ?? [];
  for (const [gi, group] of navGroups.entries()) {
      const label = group.groupName || `gruppo #${gi + 1}`;
      const seenInGroup = new Set<string>();

      for (const [ii, item] of (group.items ?? []).entries()) {
        if (item.discriminant === "url") {
          if (!item.value?.url) {
            errors.push(`versione ${version}, nav "${label}", voce #${ii + 1}: URL mancante`);
          }
          continue;
        }
        const slug = item.value?.page;
        if (!slug) {
          errors.push(`versione ${version}, nav "${label}", voce #${ii + 1}: pagina non selezionata`);
          continue;
        }
        // duplicate page entry in the same navGroup
        if (seenInGroup.has(slug)) {
          errors.push(`versione ${version}, nav "${label}": voce duplicata "${slug}"`);
          continue;
        }
        seenInGroup.add(slug);

        // nav item referencing a page of another version
        const slash = slug.indexOf("/");
        if (slash === -1) {
          errors.push(`versione ${version}, nav "${label}": "${slug}" non ha il prefisso di versione`);
          continue;
        }
        const slugVersion = slug.slice(0, slash);
        const rest = slug.slice(slash + 1);
        if (slugVersion !== version) {
          errors.push(
            `versione ${version}, nav "${label}": la voce "${slug}" punta a una pagina di un'altra versione ("${slugVersion}")`,
          );
          continue;
        }
        // nav item referencing a deleted page
        if (!(await existsPage(version, rest))) {
          errors.push(`versione ${version}, nav "${label}": la voce "${slug}" punta a una pagina inesistente`);
          continue;
        }
        refSet.add(slug);
      }
  }
  }

  // exactly one version marked as current
  if (defaultVersions.length !== 1) {
    errors.push(
      defaultVersions.length === 0
        ? "nessuna versione marcata come predefinita (isDefault)"
        : `più versioni marcate come predefinite: ${defaultVersions.join(", ")}`,
    );
  }

  // --- pages ---
  const versionsWithPages = (await readdir(PAGES_DIR, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const dir of versionsWithPages) {
    if (!versionSet.has(dir)) {
      errors.push(`pagine: la cartella "${dir}" non corrisponde a nessuna versione esistente`);
      continue;
    }
    await walkPages(dir, "", async (slug) => {
      // page slug prefix checks
      if (!(await existsPage(dir, slug))) return;
      const full = `${dir}/${slug}`;
      if (!referenced.get(dir)!.has(full)) {
        warnings.push(
          `pagina orfana: "${full}" esiste ma non è referenziata da nessun navGroups della versione (noindex)`,
        );
      }
    });
  }

  // --- licenses & material collections ---
  const licenseSlugs = new Set(
    (await readdir(LICENSES_DIR, { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .map((d) => d.name),
  );

  async function checkLicenses(filePath: string, what: string) {
    let raw: string;
    try {
      raw = await readFile(filePath, "utf8");
    } catch {
      return;
    }
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) return;
    const data = parse(m[1]) as {
      licenses?: Array<{ license?: string }>;
    };
    for (const l of data.licenses ?? []) {
      if (!l.license) {
        errors.push(`${what}: licenza non selezionata`);
      } else if (!licenseSlugs.has(l.license)) {
        errors.push(`${what}: la licenza "${l.license}" non esiste`);
      }
    }
  }

  const materialVersionDirs = (await readdir(MATERIALS_DIR, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const version of materialVersionDirs) {
    const versionMaterials = await readdir(path.join(MATERIALS_DIR, version), {
      withFileTypes: true,
    });
    for (const entry of versionMaterials) {
      if (!entry.isDirectory()) continue;
      const filePath = path.join(MATERIALS_DIR, version, entry.name, "index.mdoc");
      let raw: string;
      try {
        raw = await readFile(filePath, "utf8");
      } catch {
        continue;
      }
      const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!m) continue;
      const data = parse(m[1]) as {
        type?: string;
        licenses?: Array<{ license?: string }>;
        contains?: string[];
      };
      const what = `materiale ${version}/${entry.name}`;
      for (const l of data.licenses ?? []) {
        if (!l.license) errors.push(`${what}: licenza non selezionata`);
        else if (!licenseSlugs.has(l.license)) errors.push(`${what}: la licenza "${l.license}" non esiste`);
      }
      if (data.type === "collection") {
        for (const member of data.contains ?? []) {
          if (!(await existsMaterial(member))) {
            errors.push(`${what}: contiene il materiale inesistente "${member}"`);
          }
        }
      } else if (data.contains && data.contains.length > 0) {
        warnings.push(`${what}: ha "contains" ma non è di tipo Collezione`);
      }
    }
  }

  // licenses on manual pages (stored, not rendered)
  for (const dir of versionsWithPages) {
    await walkPages(dir, "", async (slug) => {
      const filePath = path.join(PAGES_DIR, dir, slug, "index.mdoc");
      await checkLicenses(filePath, `pagina ${dir}/${slug}`);
    });
  }

  if (warnings.length) {
    console.warn(`\n⚠ ${warnings.length} warning:`);
    for (const w of warnings) console.warn(`  ⚠ ${w}`);
  }
  if (errors.length) {
    console.error(`\n✕ ${errors.length} errori di contenuto:`);
    for (const e of errors) console.error(`  ✕ ${e}`);
    process.exit(1);
  }
  console.log("✓ Contenuto valido");
}

async function walkPages(
  dir: string,
  rel: string,
  fn: (slug: string) => Promise<void>,
) {
  const entries = await readdir(path.join(PAGES_DIR, dir, rel), { withFileTypes: true });
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const childRel = rel ? `${rel}/${e.name}` : e.name;
    if (await existsPage(dir, childRel)) {
      await fn(childRel);
    }
    await walkPages(dir, childRel, fn);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
