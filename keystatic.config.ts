import { config, collection, fields } from "@keystatic/core";

// Conditional storage: local in development, GitHub in production.
// Production requires a Keystatic GitHub App (see https://keystatic.com)
// and the KEYSTATIC_GITHUB_CLIENT_ID / KEYSTATIC_GITHUB_CLIENT_SECRET / KEYSTATIC_SECRET env vars.
const isGithubStorage =
  process.env.NODE_ENV === "production" &&
  process.env.KEYSTATIC_GITHUB_CLIENT_ID !== undefined;

export const markdocConfig = fields.markdoc.createMarkdocConfig({});

export default config({
  storage: isGithubStorage
    ? {
        kind: "github",
        repo: {
          owner: "KernelPanic92",
          name: "dungeonworld-ita",
        },
      }
    : { kind: "local" },
  collections: {
    // Minimal placeholder collection; the full schema lands in Phase 2.
    manuals: collection({
      label: "Manuali",
      slugField: "name",
      path: "docs/manuali/*",
      format: { data: "yaml" },
      schema: {
        name: fields.slug({
          name: { label: "Nome" },
          slug: { label: "Slug versione" },
        }),
        description: fields.text({ label: "Descrizione", multiline: true }),
        isDefault: fields.checkbox({ label: "Versione predefinita", defaultValue: false }),
      },
    }),
  },
});
