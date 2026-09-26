import { createReader } from "@keystatic/core/reader";
import config from "../keystatic.config";

async function main() {
  const reader = createReader(".", config);

  const materials = await reader.collections.materials.all();
  console.log(`materials: ${materials.length}`);
  for (const m of materials) {
    const e = m.entry as any;
    const issues: string[] = [];
    if (!e.name) issues.push("no name");
    if (!e.type) issues.push("no type");
    if (!e.date) issues.push("no date");
    if (!e.assets?.length) issues.push("no assets");
    if (!e.credits?.length) issues.push("no credits");
    if (issues.length) console.log(`  [ISSUE] ${m.slug}: ${issues.join(", ")}`);
  }
  const byType = materials.reduce<Record<string, number>>((acc, m) => {
    const t = (m.entry as any).type;
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});
  console.log("by type:", byType);
  const withShowcase = materials.filter((m) => (m.entry as any).showcase?.image).length;
  console.log("with showcase:", withShowcase);

  // print one full entry to eyeball the shape
  const sample = await reader.collections.materials.read("1.0/barbaro");
  console.log("sample barbaro:", JSON.stringify({
    name: (sample as any)?.name,
    version: (sample as any)?.version,
    type: (sample as any)?.type,
    source: (sample as any)?.source,
    date: (sample as any)?.date,
    collection: (sample as any)?.collection,
    license: (sample as any)?.license,
    showcase: (sample as any)?.showcase,
    credits: (sample as any)?.credits,
    assets: (sample as any)?.assets,
    contentType: typeof (sample as any)?.content,
  }, null, 1).slice(0, 2500));

  const manualPages = await reader.collections.manualPages.all();
  console.log(`\nmanualPages: ${manualPages.length}`);
  for (const p of manualPages) {
    const e = p.entry as any;
    if (!e.title) console.log(`  [ISSUE] ${p.slug}: no title`);
  }

  const authors = await reader.collections.authors.all();
  console.log(`authors: ${authors.length}`);

  const manualVersions = await reader.collections.manualVersions.all();
  console.log(`manualVersions: ${manualVersions.length}`);
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
