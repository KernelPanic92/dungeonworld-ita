import { createReader } from "@keystatic/core/reader";
import config from "../keystatic.config";

async function main() {
  const reader = createReader(".", config);

  const manuals = await reader.collections.manuals.all();
  console.log(
    "manuals:",
    manuals.map((m) => ({
      slug: m.slug,
      name: m.entry.name,
      isDefault: m.entry.isDefault,
    })),
  );

  const manual = await reader.collections.manual.all();
  console.log(
    "manual:",
    manual.map((m) => ({
      slug: m.slug,
      title: m.entry.title,
      order: m.entry.order,
      contentType: typeof m.entry.content,
      astType: (m.entry.content as unknown as () => { type?: string })()?.type,
    })),
  );

  const materials = await reader.collections.materials.all();
  console.log("materials:", materials.length);

  const authors = await reader.collections.authors.all();
  console.log(
    "authors:",
    authors.map((a) => ({
      slug: a.slug,
      completeName: a.entry.completeName,
      urls: a.entry.urls,
    })),
  );

  const settings = await reader.singletons.siteSettings.read();
  console.log("siteSettings:", {
    title: settings?.title,
    donateUrl: settings?.donateUrl,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
