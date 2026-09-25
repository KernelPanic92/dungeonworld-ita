import { collection, config, fields, singleton } from "@keystatic/core";

export const markdocConfig = fields.markdoc.createMarkdocConfig({});

// Conditional storage: local in development, GitHub in production.
// Production requires a Keystatic GitHub App (see https://keystatic.com)
// and the KEYSTATIC_GITHUB_CLIENT_ID / KEYSTATIC_GITHUB_CLIENT_SECRET / KEYSTATIC_SECRET env vars.
const isGithubStorage =
  process.env.NODE_ENV === "production" &&
  process.env.KEYSTATIC_GITHUB_CLIENT_ID !== undefined;

const MATERIAL_TYPE_OPTIONS = [
  { label: "Classe", value: "class" },
  { label: "Campagna", value: "campaign" },
  { label: "Approfondimento", value: "insight" },
  { label: "Ambientazione", value: "setting" },
  { label: "Mostro", value: "monster" },
  { label: "Equipaggiamento", value: "equipment" },
] as const;

const MATERIAL_SOURCE_OPTIONS = [
  { label: "Ufficiale", value: "official" },
  { label: "Homebrew", value: "homebrew" },
] as const;

const CREDIT_KIND_OPTIONS = [
  { label: "Autore", value: "author" },
  { label: "Illustratore", value: "illustrator" },
  { label: "Impaginazione", value: "layout" },
  { label: "Curatore editoriale", value: "editor" },
  { label: "Traduttore", value: "translator" },
  { label: "Editore", value: "publisher" },
  { label: "Creatore originale", value: "originalCreator" },
] as const;

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
    // Registry of manual versions (drives the [manual-version] URL segment).
    // Entry slug = version slug (e.g. "1.0", "2.0-beta").
    manualVersions: collection({
      label: "Manuale — Versioni",
      path: "docs/manuale/versioni/*/",
      slugField: "name",
      format: { data: "yaml" },
      schema: {
        name: fields.slug({
          name: { label: "Nome" },
          slug: { label: "Slug versione (es. 1.0)" },
        }),
        description: fields.text({ label: "Descrizione", multiline: true }),
        isDefault: fields.checkbox({
          label: "Versione predefinita",
          defaultValue: false,
        }),
      },
    }),
    // Manual pages. Entry slug = "<version>/<path>" (e.g. "1.0/classi/barbaro").
    manualPages: collection({
      label: "Manuale — Pagine",
      path: "docs/manuale/pagine/**/",
      slugField: "title",
      format: { data: "yaml", contentField: "content" },
      schema: {
        title: fields.slug({
          name: { label: "Titolo" },
          slug: { label: "Slug (versione/percorso, es. 1.0/classi/barbaro)" },
        }),
        description: fields.text({ label: "Descrizione", multiline: true }),
        order: fields.integer({ label: "Ordine nella sidebar" }),
        image: fields.image({ label: "Immagine di copertina" }),
        content: fields.markdoc({ label: "Contenuto" }),
      },
    }),
    // Materials (classes, campaigns, insights, settings, monsters, equipment).
    // Entry slug = "<version>/<material-slug>" (e.g. "1.0/barbaro").
    materials: collection({
      label: "Materiali",
      path: "docs/materiali/**/",
      slugField: "name",
      format: { data: "yaml", contentField: "content" },
      schema: {
        name: fields.slug({
          name: { label: "Nome" },
          slug: { label: "Slug (versione/nome, es. 1.0/barbaro)" },
        }),
        version: fields.text({
          label: "Versione del materiale",
          defaultValue: "1.0",
        }),
        type: fields.select({
          label: "Tipo",
          options: MATERIAL_TYPE_OPTIONS,
          defaultValue: "class",
        }),
        source: fields.select({
          label: "Provenienza",
          options: MATERIAL_SOURCE_OPTIONS,
          defaultValue: "official",
        }),
        shortDescription: fields.text({
          label: "Descrizione breve",
          multiline: true,
        }),
        description: fields.text({ label: "Descrizione", multiline: true }),
        collection: fields.text({ label: "Collezione" }),
        date: fields.date({ label: "Data" }),
        license: fields.object({
          name: fields.text({ label: "Nome licenza" }),
          url: fields.url({ label: "URL licenza" }),
        }),
        showcase: fields.object({
          image: fields.image({ label: "Immagine showcase" }),
          heroName: fields.text({ label: "Nome del personaggio" }),
        }),
        credits: fields.blocks(
          {
            credit: {
              label: "Credito",
              itemLabel: (props) =>
                String(
                  CREDIT_KIND_OPTIONS.find(
                    (o) => o.value === props.fields.kind.value,
                  )?.label ?? "Credito",
                ),
              schema: fields.object({
                author: fields.relationship({
                  label: "Autore",
                  collection: "authors",
                }),
                kind: fields.select({
                  label: "Tipo di contributo",
                  options: CREDIT_KIND_OPTIONS,
                  defaultValue: "author",
                }),
                url: fields.url({
                  label: "URL",
                  description: "Opzionale: pagina dell'autore o del contributo",
                }),
              }),
            },
          },
          { label: "Crediti" },
        ),
        assets: fields.blocks(
          {
            external: {
              label: "Asset esterno",
              itemLabel: (props) => String(props.fields.name.value || "Asset"),
              schema: fields.object({
                name: fields.text({ label: "Nome" }),
                url: fields.url({ label: "URL" }),
                thumbnail: fields.text({
                  label: "Thumbnail (URL o percorso)",
                }),
              }),
            },
            file: {
              label: "File",
              itemLabel: (props) => String(props.fields.name.value || "Asset"),
              schema: fields.object({
                name: fields.text({ label: "Nome" }),
                file: fields.file({ label: "File" }),
                thumbnail: fields.file({ label: "Thumbnail" }),
              }),
            },
          },
          { label: "Asset" },
        ),
        content: fields.markdoc({
          label: "Contenuto",
          description:
            "Solo per materiali testuali (approfondimenti, campagne, ambientazioni)",
        }),
      },
    }),
    // Authors referenced by material credits.
    authors: collection({
      label: "Autori",
      path: "docs/autori/*/",
      slugField: "completeName",
      format: { data: "yaml" },
      schema: {
        completeName: fields.slug({
          name: { label: "Nome completo" },
          slug: { label: "Slug" },
        }),
        avatar: fields.image({ label: "Avatar" }),
        urls: fields.object({
          site: fields.url({ label: "Sito" }),
          linkedin: fields.url({ label: "LinkedIn" }),
          instagram: fields.url({ label: "Instagram" }),
          facebook: fields.url({ label: "Facebook" }),
          behance: fields.url({ label: "Behance" }),
          github: fields.url({ label: "GitHub" }),
        }),
      },
    }),
  },
  singletons: {
    siteSettings: singleton({
      label: "Impostazioni sito",
      path: "docs/impostazioni-sito/",
      format: { data: "yaml" },
      schema: {
        title: fields.text({ label: "Titolo sito" }),
        description: fields.text({
          label: "Descrizione sito",
          multiline: true,
        }),
        donateUrl: fields.url({ label: "URL donazioni" }),
        githubUrl: fields.url({ label: "URL repository GitHub" }),
      },
    }),
  },
});
