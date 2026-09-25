import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { parse, stringify } from "yaml";

const VERSION = "1.0";
const MATERIALS_DIR = path.join(process.cwd(), "docs", "materiali", VERSION);
const LICENSES_DIR = path.join(process.cwd(), "docs", "licenze");

const LICENSE_SEED = [
  {
    slug: "cc-by-3.0",
    name: "Creative Commons Attribuzione 3.0 Unported",
    label: "CC BY 3.0",
    url: "https://creativecommons.org/licenses/by/3.0/deed.it",
  },
  {
    slug: "cc-by-4.0",
    name: "Creative Commons Attribuzione 4.0 Internazionale",
    label: "CC BY 4.0",
    url: "https://creativecommons.org/licenses/by/4.0/deed.it",
  },
  {
    slug: "cc-by-sa-3.0",
    name: "Creative Commons Attribuzione-Condividi allo stesso modo 3.0",
    label: "CC BY-SA 3.0",
    url: "https://creativecommons.org/licenses/by-sa/3.0/deed.it",
  },
  {
    slug: "cc-by-sa-4.0",
    name: "Creative Commons Attribuzione-Condividi allo stesso modo 4.0",
    label: "CC BY-SA 4.0",
    url: "https://creativecommons.org/licenses/by-sa/4.0/deed.it",
  },
  {
    slug: "cc0-1.0",
    name: "CC0 1.0 Universal",
    label: "CC0",
    url: "https://creativecommons.org/publicdomain/zero/1.0/deed.it",
  },
  {
    slug: "ogl-1.0a",
    name: "Open Game License 1.0a",
    label: "OGL 1.0a",
    url: "https://www.d20srd.org/ogl.htm",
  },
  {
    slug: "all-rights-reserved",
    name: "Tutti i diritti riservati",
    label: "Tutti i diritti riservati",
    url: "",
  },
];

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function frontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error("Missing frontmatter");
  return { data: parse(m[1]) as Record<string, unknown>, body: m[2].trim() };
}

function toMdoc(data: Record<string, unknown>, body: string): string {
  return `---\n${stringify(data).trimEnd()}\n---\n${body ? `\n${body}\n` : ""}`;
}

async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function licenseSlugFor(license: { name?: string; url?: string }): Promise<string> {
  const url = license.url ?? "";
  if (url.includes("/by/3.0")) return "cc-by-3.0";
  if (url.includes("/by/4.0")) return "cc-by-4.0";
  const name = license.name ?? "";
  const slug = slugify(name || url) || "all-rights-reserved";
  // unknown license: seed an entry from its data so references stay valid
  if (!LICENSE_SEED.some((l) => l.slug === slug)) {
    LICENSE_SEED.push({ slug, name, label: name, url });
  }
  return slug;
}

async function writeLicense(license: { slug: string; name: string; label: string; url: string }) {
  const dir = path.join(LICENSES_DIR, license.slug);
  const file = path.join(dir, "index.yaml");
  if (await exists(file)) return;
  await mkdir(dir, { recursive: true });
  await writeFile(
    file,
    stringify({
      name: license.name,
      label: license.label,
      ...(license.url ? { url: license.url } : {}),
    }),
  );
}

async function main() {
  console.log("Seeding licenses…");
  for (const license of LICENSE_SEED) await writeLicense(license);

  const entries = (await import("node:fs/promises")).readdir(MATERIALS_DIR, {
    withFileTypes: true,
  }).then((list) =>
    list.filter((d) => d.isDirectory()).map((d) => d.name),
  );

  const slugs = await entries;
  const materials: { slug: string; data: Record<string, unknown>; body: string }[] = [];

  for (const slug of slugs) {
    const file = path.join(MATERIALS_DIR, slug, "index.mdoc");
    if (!(await exists(file))) continue;
    const raw = await readFile(file, "utf8");
    const { data, body } = frontmatter(raw);
    if (data.type === "collection") continue; // already migrated / user content
    materials.push({ slug, data, body });
  }

  console.log(`Found ${materials.length} materials in ${VERSION}.`);

  // group by the free-text `collection` value
  const groups = new Map<string, typeof materials>();
  for (const m of materials) {
    const name = String(m.data.collection ?? "").trim();
    if (!name) continue;
    const list = groups.get(name) ?? [];
    list.push(m);
    groups.set(name, list);
  }

  console.log(`Creating ${groups.size} collection materials…`);
  for (const [name, members] of groups) {
    const collectionSlug = slugify(name);
    const dir = path.join(MATERIALS_DIR, collectionSlug);
    const file = path.join(dir, "index.mdoc");
    if (await exists(file)) {
      console.log(`  skip ${collectionSlug}: already exists`);
      continue;
    }
    const contains = members.map((m) => `${VERSION}/${m.slug}`);
    const credits = [
      ...new Map(
        members
          .flatMap((m) => {
            const list = (m.data.credits ?? []) as Array<{ discriminant: string; value: { author: string; kind: string; url?: string } }>;
            const creators = list
              .filter((c) => c.discriminant === "credit" && c.value.kind === "originalCreator")
              .map((c) => c.value);
            return creators.length > 0 ? creators : list.map((c) => c.value);
          })
          .map((c) => [c.author, c] as const),
      ).values(),
    ].map((c) => ({
      discriminant: "credit",
      value: { author: c.author, kind: c.kind, ...(c.url ? { url: c.url } : {}) },
    }));

    await mkdir(dir, { recursive: true });
    await writeFile(
      file,
      toMdoc(
        {
          name,
          version: VERSION,
          type: "collection",
          source: "homebrew",
          summary: `Collezione di ${members.length} materiali: ${members
            .map((m) => String(m.data.name ?? m.slug))
            .join(", ")}`,
          date: members
            .map((m) => String(m.data.date ?? ""))
            .filter(Boolean)
            .sort()
            .at(0),
          contains,
          ...(credits.length > 0 ? { credits } : {}),
        },
        "",
      ),
    );
    console.log(`  created ${collectionSlug} (${members.length} materials)`);
  }

  console.log("Rewriting member materials (collection field → licenses)…");
  for (const m of materials) {
    const hadCollection = Boolean(String(m.data.collection ?? "").trim());
    const hadLicense = Boolean(m.data.license);
    delete m.data.collection;
    if (hadLicense) {
      const license = m.data.license as { name?: string; url?: string };
      delete m.data.license;
      const slug = await licenseSlugFor(license);
      m.data.licenses = [{ license: slug, scope: "tutto" }];
    }
    if (hadCollection || hadLicense) {
      const file = path.join(MATERIALS_DIR, m.slug, "index.mdoc");
      await writeFile(file, toMdoc(m.data, m.body));
    }
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});