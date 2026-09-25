import { createReader } from "@keystatic/core/reader";
import config from "../keystatic.config";

async function main() {
  const reader = createReader(".", config);

  const manualVersions = await reader.collections.manualVersions.all();
  console.log(
    "manualVersions:",
    manualVersions.map((m) => ({
      slug: m.slug,
      name: m.entry.name,
      isDefault: m.entry.isDefault,
    })),
  );

  const manualPages = await reader.collections.manualPages.all();
  console.log(
    "manualPages:",
    manualPages.map((m) => ({
      slug: m.slug,
      title: m.entry.title,
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
