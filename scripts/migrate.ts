/**
 * One-time migration from the legacy Nextra site to Keystatic content.
 *
 * Inputs:
 *  - dungeonworld.yaml (47 materials: 9 standard classes, 38 homebrew classes)
 *  - web/pages/manuale MDX files (manual pages, minus generated class pages)
 *  - web/pages/homebrew/approfondimenti/guida-a-dungeon-world.mdx (insight)
 *  - web/public/assets + web/public/images (optimized assets + originals)
 *  - docs/guida-a-dungeon-world (license proofs)
 *
 * Outputs:
 *  - docs/materiali/1.0/<slug>/index.mdoc (+ asset files)
 *  - docs/manuale/1.0/<path>/index.mdoc (+ meta.json for folders)
 *  - docs/autori/<slug>/index.yaml
 *  - public/images/pages (content images referenced by manual markdown)
 *  - scripts/migration-report.md
 *
 * Run: pnpm exec tsx scripts/migrate.ts [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { parse as parseYaml } from "yaml";

const ROOT = path.resolve(__dirname, "..");
const DRY = process.argv.includes("--dry");

const warnings: string[] = [];
const log = (msg: string) => console.log(msg);
const warn = (msg: string) => {
  warnings.push(msg);
  console.log(`  [WARN] ${msg}`);
};

function write(relPath: string, content: string) {
  if (DRY) {
    log(`  (dry) would write ${relPath} (${content.length} chars)`);
    return;
  }
  const abs = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf8");
}

/** Fuzzy fallback: resolve each path segment ignoring non-alphanumerics */
function findFuzzy(srcRel: string): string | null {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const segments = srcRel.split("/");
  let current = ROOT;
  const resolved: string[] = [];
  for (const seg of segments) {
    let candidates: string[];
    try {
      candidates = fs.readdirSync(current);
    } catch {
      return null;
    }
    let match = candidates.find((f) => f === seg);
    if (!match) {
      const target = norm(seg);
      const ext = path.extname(seg).toLowerCase();
      match = candidates.find((f) => {
        if (ext && path.extname(f).toLowerCase() !== ext) return false;
        return norm(f) === target;
      });
    }
    if (!match) return null;
    resolved.push(match);
    current = path.join(current, match);
  }
  return resolved.join("/");
}

function copy(srcRel: string, destRel: string) {
  let src = path.join(ROOT, srcRel);
  if (!fs.existsSync(src)) {
    const fuzzy = findFuzzy(srcRel);
    if (fuzzy) {
      log(`  fuzzy match: ${srcRel} -> ${fuzzy}`);
      srcRel = fuzzy;
      src = path.join(ROOT, fuzzy);
    }
  }
  if (!fs.existsSync(src)) {
    warn(`missing source file, skip copy: ${srcRel}`);
    return false;
  }
  if (DRY) {
    log(`  (dry) would copy ${srcRel} -> ${destRel}`);
    return true;
  }
  const dest = path.join(ROOT, destRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return true;
}

/** Case.kebab-compatible slugify (apostrophes removed, other separators dashed) */
function kebab(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\u2018\u2019'`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitAuthors(raw: string): string[] {
  return raw
    .split(/\s+e\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function gitLastDate(relPaths: string[]): string {
  try {
    const out = execSync(
      `git log -1 --format=%cI -- ${relPaths.map((p) => `"${p}"`).join(" ")}`,
      { cwd: ROOT, encoding: "utf8" },
    ).trim();
    return out ? out.slice(0, 10) : "2024-01-01";
  } catch {
    return "2024-01-01";
  }
}

// ---------------------------------------------------------------------------
// Legacy YAML models (subset)
// ---------------------------------------------------------------------------
interface LegacyAsset {
  name: string;
  path: string;
}
interface LegacyCredit {
  kind: string;
  contributors: string[];
}
interface LegacyClass {
  name: string;
  license: { name: string; url: string };
  assets: LegacyAsset[];
  shortDescription: string;
  description: string;
  credits: LegacyCredit[];
  showcase: { imagePath: string; heroName: string };
  // homebrew only
  authors?: string;
  collection?: string;
  compendium?: boolean;
}
interface LegacyData {
  dungeonWorld: {
    homebrew: { classes: LegacyClass[] };
    standard: {
      classes: LegacyClass[];
      frontsSummary: LegacyAsset;
      gameMasterSummary: LegacyAsset;
      movesSummary: LegacyAsset;
    };
  };
}

const CC_BY_30 = {
  name: "Creative Commons Attribution 3.0 Unported License",
  url: "https://creativecommons.org/licenses/by/3.0/deed.it",
};

// ---------------------------------------------------------------------------
// YAML frontmatter serializer (Keystatic-compatible)
// ---------------------------------------------------------------------------
function fmValue(v: unknown): string {
  if (typeof v === "string") {
    // quote when the string could break YAML plain scalars:
    // multiline, special chars, leading/trailing spaces, bool/null/number lookalikes
    const needsQuote =
      v === "" ||
      v.includes("\n") ||
      /[:#{}[&*!|>'"%@`]/.test(v) ||
      /^\s|\s$/.test(v) ||
      /^(true|false|null|~)$/i.test(v) ||
      /^[-?:]/.test(v) ||
      /^[\d.]+$/.test(v);
    if (needsQuote) {
      return JSON.stringify(v);
    }
    return v;
  }
  if (v === null || v === undefined) return "null";
  return JSON.stringify(v);
}

function toFrontmatter(data: Record<string, unknown>): string {
  const lines: string[] = [];
  const emit = (obj: Record<string, unknown>, indent: number) => {
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined) continue;
      const pad = " ".repeat(indent);
      if (Array.isArray(v)) {
        if (v.length === 0) {
          lines.push(`${pad}${k}: []`);
          continue;
        }
        lines.push(`${pad}${k}:`);
        for (const item of v) {
          if (item && typeof item === "object" && !Array.isArray(item)) {
            const rec = item as Record<string, unknown>;
            // blocks/conditional shape: discriminant + value
            lines.push(`${pad}  - discriminant: ${fmValue(rec.discriminant)}`);
            lines.push(`${pad}    value:`);
            const val = rec.value as Record<string, unknown>;
            for (const [k2, v2] of Object.entries(val)) {
              if (v2 === undefined) continue;
              if (v2 && typeof v2 === "object" && !Array.isArray(v2)) {
                const nested = v2 as Record<string, unknown>;
                lines.push(`${pad}      ${k2}:`);
                for (const [k3, v3] of Object.entries(nested)) {
                  if (v3 === undefined) continue;
                  lines.push(`${pad}        ${k3}: ${fmValue(v3)}`);
                }
              } else {
                lines.push(`${pad}      ${k2}: ${fmValue(v2)}`);
              }
            }
          } else {
            lines.push(`${pad}  - ${fmValue(item)}`);
          }
        }
      } else if (v && typeof v === "object") {
        const nested = v as Record<string, unknown>;
        const hasKeys = Object.entries(nested).some(([, x]) => x !== undefined);
        if (!hasKeys) {
          lines.push(`${pad}${k}: {}`);
          continue;
        }
        lines.push(`${pad}${k}:`);
        emit(nested, indent + 2);
      } else {
        lines.push(`${pad}${k}: ${fmValue(v)}`);
      }
    }
  };
  emit(data, 0);
  return lines.join("\n");
}

function materialEntry(opts: {
  name: string;
  type: string;
  source: string;
  shortDescription?: string;
  description?: string;
  collection?: string;
  date: string;
  license?: { name: string; url: string } | null;
  showcase?: { image?: string; heroName?: string } | null;
  credits: Array<{ author: string; kind: string; url?: string }>;
  assets: Array<
    | { type: "file"; name: string; file: string; thumbnail: string }
    | { type: "external"; name: string; url: string; thumbnail: string }
  >;
  content?: string;
}): string {
  const data: Record<string, unknown> = {
    name: opts.name,
    version: "1.0",
    type: opts.type,
    source: opts.source,
  };
  if (opts.shortDescription) data.shortDescription = opts.shortDescription;
  if (opts.description) data.description = opts.description;
  if (opts.collection) data.collection = opts.collection;
  data.date = opts.date;
  if (opts.license) data.license = { name: opts.license.name, url: opts.license.url };
  if (opts.showcase && Object.values(opts.showcase).some(Boolean)) {
    data.showcase = {
      image: opts.showcase.image || undefined,
      heroName: opts.showcase.heroName || undefined,
    };
  }
  data.credits = opts.credits.map((c) => ({
    discriminant: "credit",
    value: { author: c.author, kind: c.kind, url: c.url ?? undefined },
  }));
  data.assets = opts.assets.map((a) =>
    a.type === "file"
      ? { discriminant: "file", value: { name: a.name, file: a.file, thumbnail: a.thumbnail } }
      : { discriminant: "external", value: { name: a.name, url: a.url, thumbnail: a.thumbnail } },
  );
  return `---\n${toFrontmatter(data)}\n---\n${opts.content ?? ""}`;
}

// ---------------------------------------------------------------------------
// MDX -> MarkDoc conversion
// ---------------------------------------------------------------------------
const DOWNLOAD_REFS: Record<string, { slug: string; name: string }> = {
  "dungeonWorldData.standard.movesSummary": {
    slug: "riassunto-delle-mosse",
    name: "Riassunto Delle Mosse",
  },
  "dungeonWorldData.standard.gameMasterSummary": {
    slug: "riassunto-del-gm",
    name: "Riassunto del GM",
  },
  "dungeonWorldData.standard.frontsSummary": {
    slug: "scheda-dei-fronti",
    name: "Scheda Dei Fronti",
  },
};

const ENTITIES: Record<string, string> = {
  "&ndash;": "\u2013",
  "&mdash;": "\u2014",
  "&ldquo;": "\u201c",
  "&rdquo;": "\u201d",
  "&lsquo;": "\u2018",
  "&rsquo;": "\u2019",
  "&hellip;": "\u2026",
  "&amp;": "&",
};

interface Protected {
  restore(text: string): string;
}

function convertMdxToMarkdoc(body: string, ctx: string): string {
  // protect fenced code blocks from any transformation
  const blocks: string[] = [];
  let out = body.replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g, (m) => {
    blocks.push(m);
    return `@@FENCE${blocks.length - 1}@@`;
  });

  // 1. strip imports
  out = out.replace(/^import\s+.*$/gm, "");
  // 2. strip JSX comments
  out = out.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  // 3. Star component -> DW star glyph
  out = out.replace(/<Star\s*\/>/g, "\u2734 ");
  // 4. <br/>
  out = out.replace(/<br\s*\/?>/g, "\n\n");
  // 5. Callout -> {% callout %}
  out = out.replace(/<Callout([^>]*)>([\s\S]*?)<\/Callout>/g, (_m, attrs: string, inner: string) => {
    const type = attrs.match(/type="([^"]*)"/)?.[1] ?? "info";
    const emoji = attrs.match(/emoji="([^"]*)"/)?.[1];
    const prefix = emoji ? `${emoji} ` : "";
    return `{% callout type="${type}" %}\n${prefix}${inner.trim()}\n{% /callout %}`;
  });
  // 6. Steps -> {% steps %}
  out = out.replace(/<Steps>([\s\S]*?)<\/Steps>/g, (_m, inner: string) => {
    return `{% steps %}\n${inner.trim()}\n{% /steps %}`;
  });
  // 7. DownloadLink with data refs
  out = out.replace(
    /<DownloadLink\s+href=\{([^}]+)\}>\{?([^}<]*)\}?<\/DownloadLink>/g,
    (_m, ref: string, _nameRef: string) => {
      const norm = ref.trim().replace(/\.(url|name)$/, "");
      const mapping = DOWNLOAD_REFS[norm];
      if (!mapping) {
        warn(`${ctx}: unresolved DownloadLink ref ${ref}`);
        return _m;
      }
      return `[${mapping.name}](/materiali/${mapping.slug})`;
    },
  );
  // 7b. DownloadLink with static href (guida pdf)
  out = out.replace(
    /<DownloadLink\s+href="([^"]+)"[^>]*>([^<]+)<\/DownloadLink>/g,
    (_m, href: string, label: string) => {
      if (href.includes("guida-a-dungeon-world.pdf")) {
        return `[${label.trim()}](/materiali/guida-a-dungeon-world)`;
      }
      warn(`${ctx}: unresolved static DownloadLink ${href}`);
      return _m;
    },
  );
  // 8. internal link remaps
  out = out.replace(/\]\(\/homebrew\/approfondimenti\/guida-a-dungeon-world\)/g, "](/materiali/guida-a-dungeon-world)");
  out = out.replace(/\]\(\/homebrew\/classi\)/g, "](/materiali?type=class)");
  // 9. entities
  for (const [ent, chr] of Object.entries(ENTITIES)) {
    out = out.split(ent).join(chr);
  }
  // 10. collapse >2 blank lines caused by import stripping
  out = out.replace(/\n{3,}/g, "\n\n");

  // restore fences
  out = out.replace(/@@FENCE(\d+)@@/g, (_, i) => blocks[Number(i)]);

  // detect leftovers
  const leftovers = out.match(/<\/?[A-Z][A-Za-z]*|<\/[a-zA-Z]+>/g);
  if (leftovers) {
    const uniq = [...new Set(leftovers)];
    const filtered = uniq.filter((t) => !/^<\/?(Star|br)/.test(t));
    if (filtered.length) warn(`${ctx}: unconverted JSX: ${filtered.join(", ")}`);
  }
  if (/\{dungeonWorldData|<DownloadLink|<Callout|<Steps/.test(out)) {
    warn(`${ctx}: leftover dynamic markers`);
  }

  return out.trim() + "\n";
}

function parseMdxFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };
  const data = parseYaml(m[1]) as Record<string, string>;
  return { data, body: m[2] };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  log("== Loading legacy data ==");
  const legacy = parseYaml(
    fs.readFileSync(path.join(ROOT, "dungeonworld.yaml"), "utf8"),
  ) as LegacyData;
  const std = legacy.dungeonWorld.standard;
  const hb = legacy.dungeonWorld.homebrew;

  // ------------------------------------------------------------------ authors
  log("== Authors ==");
  const authorMap = new Map<string, string>(); // display name -> slug
  const addAuthor = (name: string): string => {
    const clean = name.trim();
    const slug = kebab(clean);
    if (!authorMap.has(clean)) {
      authorMap.set(clean, slug);
      write(
        path.join("docs/autori", slug, "index.yaml"),
        `completeName: ${fmValue(clean)}\nurls: {}\n`,
      );
    }
    return slug;
  };

  const KIND_MAP: Record<string, string> = {
    Traduzione: "translator",
    Immagine: "illustrator",
    Impaginazione: "layout",
  };
  const mapCredits = (clazz: LegacyClass) => {
    const credits: Array<{ author: string; kind: string }> = [];
    for (const c of clazz.credits ?? []) {
      const kind = KIND_MAP[c.kind];
      if (!kind) {
        warn(`unmapped credit kind "${c.kind}" on "${clazz.name}"`);
        continue;
      }
      for (const contrib of c.contributors) {
        credits.push({ author: addAuthor(contrib), kind });
      }
    }
    if (clazz.authors) {
      for (const a of splitAuthors(clazz.authors)) {
        credits.push({ author: addAuthor(a), kind: "originalCreator" });
      }
    }
    return credits;
  };

  // ------------------------------------------------------------------ helpers
  const legacyAssetFiles = (clazz: LegacyClass): string[] => {
    const paths = (clazz.assets ?? []).map((a) => a.path.replace(/^\.\//, ""));
    paths.push(clazz.showcase.imagePath.replace(/^\.\//, ""));
    return paths;
  };

  const copyClassAssets = (clazz: LegacyClass, entryDir: string, base: "standard" | "homebrew") => {
    const nameK = kebab(clazz.name);
    const authorsK = clazz.authors ? kebab(clazz.authors) : null;
    const collectionK = clazz.collection ? kebab(clazz.collection) : null;
    const heroK = kebab(clazz.showcase.heroName);
    const heroExt = path.extname(clazz.showcase.imagePath);

    const assets: Array<{ type: "file"; name: string; file: string; thumbnail: string }> = [];
    for (const asset of clazz.assets) {
      const assetK = kebab(asset.name);
      const ext = path.extname(asset.path);
      const relBase =
        base === "standard"
          ? `web/public/assets/classi/standard/${nameK}/${assetK}`
          : `web/public/assets/classi/homebrew/${authorsK}/${collectionK}/${nameK}/${assetK}`;
      const pdfOk = copy(`${relBase}${ext}`, `${entryDir}/${assetK}${ext}`);
      const thumbOk = copy(`${relBase}-thumbnail.webp`, `${entryDir}/${assetK}-thumbnail.webp`);
      if (!pdfOk || !thumbOk) {
        warn(`asset incomplete for "${asset.name}" (${clazz.name}): ${relBase}${ext}`);
      }
      assets.push({
        type: "file",
        name: asset.name,
        file: `${assetK}${ext}`,
        thumbnail: `${assetK}-thumbnail.webp`,
      });
    }
    const showcaseBase =
      base === "standard"
        ? `web/public/images/classi/standard/${nameK}/${heroK}${heroExt}`
        : `web/public/images/classi/homebrew/${authorsK}/${collectionK}/${nameK}/${heroK}${heroExt}`;
    const showcaseOk = copy(showcaseBase, `${entryDir}/${heroK}${heroExt}`);
    if (!showcaseOk) warn(`showcase missing for ${clazz.name}: ${showcaseBase}`);
    return {
      assets,
      showcase: showcaseOk
        ? { image: `${heroK}${heroExt}`, heroName: clazz.showcase.heroName }
        : null,
    };
  };

  // ------------------------------------------------------------------ materials: standard classes
  log("== Materials: standard classes ==");
  for (const clazz of std.classes) {
    const slug = kebab(clazz.name);
    const entryDir = `docs/materiali/1.0/${slug}`;
    const { assets, showcase } = copyClassAssets(clazz, entryDir, "standard");
    const date = gitLastDate(legacyAssetFiles(clazz));
    write(
      path.join(entryDir, "index.mdoc"),
      materialEntry({
        name: clazz.name,
        type: "class",
        source: "official",
        shortDescription: clazz.shortDescription,
        description: clazz.description,
        date,
        license: clazz.license,
        showcase,
        credits: mapCredits(clazz),
        assets,
      }),
    );
    log(`  material: ${slug}`);
  }

  // ------------------------------------------------------------------ materials: homebrew classes
  log("== Materials: homebrew classes ==");
  for (const clazz of hb.classes) {
    const slug = kebab(`${clazz.authors} ${clazz.collection} ${clazz.name}`);
    const entryDir = `docs/materiali/1.0/${slug}`;
    const { assets, showcase } = copyClassAssets(clazz, entryDir, "homebrew");
    const date = gitLastDate(legacyAssetFiles(clazz));
    write(
      path.join(entryDir, "index.mdoc"),
      materialEntry({
        name: clazz.name,
        type: "class",
        source: "homebrew",
        shortDescription: clazz.shortDescription,
        description: clazz.description,
        collection: clazz.collection,
        date,
        license: clazz.license,
        showcase,
        credits: mapCredits(clazz),
        assets,
      }),
    );
    log(`  material: ${slug}`);
  }

  // ------------------------------------------------------------------ materials: standard summaries
  log("== Materials: standard summaries ==");
  const summaries: Array<[string, LegacyAsset, string]> = [
    ["Riassunto del GM", std.gameMasterSummary, "web/public/assets/standard"],
    ["Scheda Dei Fronti", std.frontsSummary, "web/public/assets/standard"],
    ["Riassunto Delle Mosse", std.movesSummary, "web/public/assets/standard"],
  ];
  for (const [name, asset, pubDir] of summaries) {
    const slug = kebab(name);
    const entryDir = `docs/materiali/1.0/${slug}`;
    const assetK = kebab(asset.name);
    const ext = path.extname(asset.path);
    const date = gitLastDate([asset.path.replace(/^\.\//, "")]);
    copy(`${pubDir}/${assetK}${ext}`, `${entryDir}/${assetK}${ext}`);
    copy(`${pubDir}/${assetK}-thumbnail.webp`, `${entryDir}/${assetK}-thumbnail.webp`);
    write(
      path.join(entryDir, "index.mdoc"),
      materialEntry({
        name,
        type: "insight",
        source: "official",
        shortDescription: `${name}: materiale di supporto ufficiale di Dungeon World.`,
        description: `${name}: materiale di supporto ufficiale di Dungeon World, pronto da stampare.`,
        date,
        license: CC_BY_30,
        showcase: null,
        credits: [{ author: addAuthor("dungeonworld.it"), kind: "translator" }],
        assets: [
          {
            type: "file",
            name: asset.name,
            file: `${assetK}${ext}`,
            thumbnail: `${assetK}-thumbnail.webp`,
          },
        ],
      }),
    );
    log(`  material: ${slug}`);
  }

  // ------------------------------------------------------------------ materials: guida (insight)
  log("== Materials: guida a dungeon world ==");
  {
    const slug = "guida-a-dungeon-world";
    const entryDir = `docs/materiali/1.0/${slug}`;
    const rawGuida = fs.readFileSync(
      path.join(ROOT, "web/pages/homebrew/approfondimenti/guida-a-dungeon-world.mdx"),
      "utf8",
    );
    const { data: guidaFm, body: guidaBody } = parseMdxFrontmatter(rawGuida);
    const content = convertMdxToMarkdoc(guidaBody, "guida-a-dungeon-world.mdx");
    copy("web/public/assets/approfondimenti/guida-a-dungeon-world.pdf", `${entryDir}/guida-a-dungeon-world.pdf`);
    copy("web/public/images/pages/homebrew/approfondimenti/copertina.jpg", `${entryDir}/copertina.jpg`);
    // license proofs (kept as reference files inside the entry)
    copy("docs/guida-a-dungeon-world/CC-BY-4.0-GuidaDungeonWorld.md", `${entryDir}/licenza-CC-BY-4.0.md`);
    copy("docs/guida-a-dungeon-world/licenza-gabriele-falcon-boldreghini.png", `${entryDir}/licenza-gabriele-falcon-boldreghini.png`);
    copy("docs/guida-a-dungeon-world/gabriele-falcon-boldreghini-profile-check.png", `${entryDir}/gabriele-falcon-boldreghini-profile-check.png`);
    const date = gitLastDate([
      "docs/guida-a-dungeon-world",
      "web/pages/homebrew/approfondimenti/guida-a-dungeon-world.mdx",
    ]);
    const credits = [
      { author: addAuthor("Eon Fontes-May"), kind: "originalCreator" },
      { author: addAuthor("Sean M. Dunstan"), kind: "originalCreator" },
      { author: addAuthor('Gabriele "Falcon" Boldreghini'), kind: "translator" },
    ];
    write(
      path.join(entryDir, "index.mdoc"),
      materialEntry({
        name: guidaFm.title ?? "Guida a Dungeon World",
        type: "insight",
        source: "homebrew",
        shortDescription:
          "La guida di approfondimento della community per capire davvero Dungeon World: la meccanica della conversazione, le mosse del GM, il combattimento senza iniziativa, i Fronti e un lungo esempio di gioco commentato.",
        description: guidaFm.description,
        collection: "Approfondimenti",
        date,
        license: {
          name: "Creative Commons Attribution 4.0 International",
          url: "https://creativecommons.org/licenses/by/4.0/deed.it",
        },
        showcase: { image: "copertina.jpg" },
        credits,
        assets: [
          {
            type: "file",
            name: "Guida a Dungeon World (PDF originale)",
            file: "guida-a-dungeon-world.pdf",
            thumbnail: "copertina.jpg",
          },
        ],
        content,
      }),
    );
    log(`  material: ${slug}`);
  }

  // ------------------------------------------------------------------ manual pages
  log("== Manual pages ==");
  const MANUALE_SRC = "web/pages/manuale";
  const readMeta = (dir: string): Record<string, string> => {
    const p = path.join(ROOT, MANUALE_SRC, dir, "_meta.json");
    if (!fs.existsSync(p)) return {};
    return JSON.parse(fs.readFileSync(p, "utf8"));
  };

  const orderOf = (dir: string, key: string, meta: Record<string, string>): number => {
    const keys = [...Object.keys(meta), ...listMdx(dir).filter((f) => f !== "_meta.json" && !(f in meta))];
    const idx = keys.indexOf(key);
    return idx >= 0 ? idx + 1 : 999;
  };

  const listMdx = (dir: string): string[] =>
    fs
      .readdirSync(path.join(ROOT, MANUALE_SRC, dir), { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith(".mdx") && e.name !== "_meta.json")
      .map((e) => e.name.replace(/\.mdx$/, ""));

  const listDirs = (dir: string): string[] =>
    fs
      .readdirSync(path.join(ROOT, MANUALE_SRC, dir), { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);

  // custom replacement for the generated class listing page
  const classiContent = `Qui trovi tutte le classi di **Dungeon World**, ideali per giocatori di tutti i livelli.

Se sei alle prime armi con Dungeon World, ti consiglio vivamente di iniziare con una delle classi ufficiali. Queste classi sono state attentamente bilanciate e progettate per offrire un'esperienza di gioco fluida e coinvolgente. Utilizzando una classe standard, potrai concentrarti sull'apprendimento delle meccaniche di gioco e sull'esplorazione del mondo di Dungeon World, senza le potenziali complicazioni di gestire un libretto homebrew.

Le classi ufficiali offrono una vasta gamma di ruoli e abilità, che ti permetteranno di trovare il personaggio perfetto per il tuo stile di gioco. Che tu voglia essere un impavido guerriero, un astuto ladro, o un potente mago, c'è una classe che fa per te!

{% callout type="info" %}
Le schede delle classi (ufficiali e homebrew) sono ora raccolte nella sezione **[Materiali](/materiali?type=class)**, dove puoi filtrarle e scaricarne i libretti.
{% /callout %}

Se invece hai già esperienza con Dungeon World e sei alla ricerca di qualcosa di nuovo ed eccitante, potresti essere interessato alle classi homebrew. Questi libretti, creati dalla community, offrono nuove sfide e possibilità di personalizzazione: dai un'occhiata alle [classi homebrew](/materiali?type=class&source=homebrew).
`;

  const migrateDir = (relDir: string, outDir: string, folderTitle: string) => {
    const meta = readMeta(relDir);
    const mdxFiles = listMdx(relDir);
    const dirs = listDirs(relDir);
    const pages: string[] = [];

    for (const file of mdxFiles) {
      const rel = path.join(relDir, `${file}.mdx`);
      const raw = fs.readFileSync(path.join(ROOT, MANUALE_SRC, rel), "utf8");
      const { data: fm, body } = parseMdxFrontmatter(raw);

      const title = (fm.title as string) ?? file;
      const entryDir = path.join(outDir, file);
      const order = orderOf(relDir, file, meta);
      const isClassi = relDir === "." && file === "classi";
      const content = isClassi ? classiContent : convertMdxToMarkdoc(body, rel);

      const data: Record<string, unknown> = {
        title,
        description: fm.description ?? "",
        order,
      };
      write(path.join(entryDir, "index.mdoc"), `---\n${toFrontmatter(data)}\n---\n${content}`);
      pages.push(file === "index" ? "index" : file);
      log(`  manual page: ${outDir}/${file} (order ${order})`);
    }

    for (const dir of dirs) {
      if (dir === "classi") continue; // generated pages -> materials
      pages.push(dir);
      migrateDir(path.join(relDir, dir), path.join(outDir, dir), meta[dir] ?? dir);
    }

    // write folder meta.json (Fumadocs-style) with explicit ordering
    const ordered = Object.keys(meta).filter((k) => pages.includes(k));
    const remaining = pages.filter((p) => !ordered.includes(p)).sort();
    const finalPages = [...ordered, ...remaining];
    const metaOut: Record<string, unknown> = { pages: finalPages };
    if (folderTitle) metaOut.title = folderTitle;
    write(path.join(outDir, "meta.json"), JSON.stringify(metaOut, null, 2) + "\n");
  };

  migrateDir(".", "docs/manuale/1.0", "Manuale");

  // ------------------------------------------------------------------ public images
  log("== Public content images ==");
  copyDir("web/public/images/pages", "public/images/pages");
  copy("web/public/images/dungeon-world-cover.webp", "public/images/dungeon-world-cover.webp");

  // ------------------------------------------------------------------ report
  const report = [
    "# Migration report",
    "",
    `Date: ${new Date().toISOString()}`,
    `Dry run: ${DRY}`,
    "",
    `Authors: ${authorMap.size}`,
    `Warnings: ${warnings.length}`,
    "",
    ...warnings.map((w) => `- ${w}`),
  ].join("\n");
  if (!DRY) {
    fs.mkdirSync(path.join(ROOT, "scripts"), { recursive: true });
    fs.writeFileSync(path.join(ROOT, "scripts/migration-report.md"), report, "utf8");
  }
  log(`\nDone. ${warnings.length} warnings (see scripts/migration-report.md)`);
}

function copyDir(srcRel: string, destRel: string) {
  const src = path.join(ROOT, srcRel);
  if (!fs.existsSync(src)) {
    warn(`missing source dir, skip: ${srcRel}`);
    return;
  }
  if (DRY) {
    log(`  (dry) would copy dir ${srcRel} -> ${destRel}`);
    return;
  }
  fs.cpSync(src, path.join(ROOT, destRel), { recursive: true });
}

main();
