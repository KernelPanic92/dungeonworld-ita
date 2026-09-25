import type { Metadata } from "next";
import { readMdocBody } from "@/lib/keystatic";
import { compiler, markdocToMdx, mdxComponents } from "@/components/mdx";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { JsonLd } from "@/components/site/json-ld";
import { aboutPageJsonLd } from "@/lib/schema-org";

const PROGETTO_DESCRIPTION =
  "L'obiettivo del progetto è offrire una traduzione completa e accurata di Dungeon World e dei materiali homebrew, creando un unico punto di accesso per gli appassionati.";

export const metadata: Metadata = {
  title: "Il progetto",
  description: PROGETTO_DESCRIPTION,
  alternates: { canonical: "/progetto" },
};

export default async function ProgettoPage() {
  const content = await readMdocBody("docs/progetto.mdoc");
  const { body: MdxContent } = await compiler.compile({
    source: markdocToMdx(content),
    filePath: "docs/progetto.mdoc",
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
        <JsonLd
          data={aboutPageJsonLd({
            url: "/progetto",
            title: "Il progetto",
            description: PROGETTO_DESCRIPTION,
          })}
        />
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <MdxContent components={mdxComponents} />
        </article>
      </main>
      <SiteFooter />
    </>
  );
}