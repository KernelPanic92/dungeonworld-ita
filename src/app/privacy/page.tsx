import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../../keystatic.config";
import { renderMarkdoc } from "@/lib/content/markdoc/render";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Informativa sul trattamento dei dati personali su dungeonworld-italia.it: quali dati raccogliamo, perché e quali sono i tuoi diritti.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const reader = createReader(".", keystaticConfig);
  const doc = await reader.singletons.privacyPolicy.read();
  if (!doc) notFound();

  const { node } = await doc.content();
  const { content } = renderMarkdoc(node);
  const updated = doc.updated
    ? new Date(doc.updated).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          {content}
        </article>
        {updated ? (
          <p className="mt-8 text-sm text-fd-muted-foreground">
            Ultimo aggiornamento: {updated}.
          </p>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}