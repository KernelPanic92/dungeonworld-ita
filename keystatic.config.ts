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
  { label: "Collezione", value: "collection" },
] as const;

const MATERIAL_SOURCE_OPTIONS = [
  { label: "Ufficiale", value: "official" },
  { label: "Homebrew", value: "homebrew" },
] as const;

// Target of a license entry: what part of the material/document it applies to.
// A single PDF can mix several (e.g. text under one license, images under another).
const LICENSE_SCOPE_OPTIONS = [
  { label: "Tutto il contenuto", value: "tutto" },
  { label: "Contenuti testuali", value: "testo" },
  { label: "Traduzione", value: "traduzione" },
  { label: "Prefazioni, postfazioni e saggi", value: "testi-secondari" },
  { label: "Snippet di codice", value: "codice" },
  { label: "Immagini interne (foto, illustrazioni, grafici)", value: "immagini" },
  { label: "Copertina", value: "copertina" },
  { label: "Design e impaginazione", value: "layout" },
  { label: "Font incorporati", value: "font" },
  { label: "Script e interattività", value: "script" },
  { label: "Dataset", value: "dati" },
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

const NAV_KIND_OPTIONS = [
  { label: "Pagina", value: "page" },
  { label: "URL esterno", value: "url" },
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
        // The whole sidebar is defined here, as an ordered structure.
        // Each navGroup is a sidebar section; items are pages or external
        // urls only (flat, no subgroups).
        navGroups: fields.array(
          fields.object({
            groupName: fields.text({
              label: "Nome del gruppo",
              description:
                "Etichetta libera mostrata nella sidebar (non fa parte degli URL). Lascia vuoto per le voci di primo livello.",
            }),
            items: fields.array(
              fields.conditional(
                fields.select({
                  label: "Tipo di voce",
                  options: NAV_KIND_OPTIONS,
                  defaultValue: "page",
                }),
                {
                  page: fields.object({
                    page: fields.relationship({
                      label: "Pagina",
                      collection: "manualPages",
                      validation: { isRequired: true },
                    }),
                  }),
                  url: fields.object({
                    label: fields.text({
                      label: "Etichetta",
                      validation: { isRequired: true },
                    }),
                    url: fields.url({
                      label: "URL",
                      validation: { isRequired: true },
                    }),
                  }),
                },
              ),
              {
                label: "Voci",
                itemLabel: (props) => {
                  const p = props as {
                    discriminant: string;
                    value: { fields: Record<string, { value: unknown }> };
                  };
                  if (p.discriminant === "url") {
                    return (
                      String(p.value.fields.label.value || "") ||
                      String(p.value.fields.url.value || "Link")
                    );
                  }
                  return String(p.value.fields.page.value || "Pagina non selezionata");
                },
              },
            ),
          }),
          {
            label: "Gruppi di navigazione",
            itemLabel: (props) => [
              props.fields.groupName.value,
              `${props.fields.items.elements.length}`,
            ].filter(Boolean).join(' - '),
          },
        ),
      },
    }),
    // Manual pages. Entry slug = "<version>/<path>" (e.g. "1.0/classi/barbaro").
    manualPages: collection({
      label: "Manuale — Pagine",
      path: "docs/manuale/pagine/**/",
      slugField: "title",
      format: { data: "yaml", contentField: "content" },
      template: "1.0/come-giocare",
      schema: {
        title: fields.slug({
          name: { label: "Titolo" },
          slug: {
            label: "Slug",
            description:
              "Il primo segmento è la versione, seguito dal percorso della pagina (es. 2.0-beta/introduzione/regole-base).",
          },
        }),
        description: fields.text({ label: "Descrizione", multiline: true }),
        image: fields.image({ label: "Immagine di copertina" }),
        licenses: fields.array(
          fields.object({
            license: fields.relationship({
              label: "Licenza",
              collection: "licenses",
            }),
            scope: fields.select({
              label: "Applicabile a",
              description:
                "A quale parte del contenuto si applica questa licenza.",
              options: LICENSE_SCOPE_OPTIONS,
              defaultValue: "tutto",
            }),
          }),
          {
            label: "Licenze",
            itemLabel: (props) => `${props.fields.scope.value} - ${props.fields.license.value}`,
          },
        ),
        content: fields.markdoc({ label: "Contenuto" }),
      },
    }),
    // Materials (classes, campaigns, insights, settings, monsters, equipment,
    // collections). Entry slug = "<version>/<material-slug>" (e.g. "1.0/barbaro").
    // A collection is a material with type "collection" whose `contains` field
    // lists the materials it groups; membership is stored only here.
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
        date: fields.date({ label: "Data" }),
        licenses: fields.array(
          fields.object({
            license: fields.relationship({
              label: "Licenza",
              collection: "licenses",
            }),
            scope: fields.select({
              label: "Applicabile a",
              description:
                "A quale parte del materiale si applica questa licenza.",
              options: LICENSE_SCOPE_OPTIONS,
              defaultValue: "tutto",
            }),
          }),
          {
            label: "Licenze",
            itemLabel: (props) => `${props.fields.scope.value} - ${props.fields.license.value}`,
          },
        ),
        contains: fields.multiRelationship({
          label: "Materiali contenuti",
          collection: "materials",
          description:
            "Solo per i materiali di tipo Collezione: l'elenco dei materiali che raggruppa.",
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
    // Licenses referenced by materials and manual pages.
    licenses: collection({
      label: "Licenze",
      path: "docs/licenze/*/",
      slugField: "name",
      format: { data: "yaml" },
      schema: {
        name: fields.slug({
          name: { label: "Nome" },
          slug: { label: "Slug" },
        }),
        label: fields.text({
          label: "Etichetta breve",
          description: "Testo mostrato nei filtri e nelle pagine (es. CC BY 4.0)",
        }),
        url: fields.url({
          label: "URL",
          description: "Pagina ufficiale della licenza (opzionale)",
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
