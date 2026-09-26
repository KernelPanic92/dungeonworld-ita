import type { Metadata } from "next";
import Link from "next/link";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../../keystatic.config";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Cookie e strumenti di tracciamento usati da dungeonworld-italia.it: cosa li installa, con quali finalità e come gestire le preferenze.",
  alternates: { canonical: "/cookie-policy" },
};

interface CookieRow {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
}

function CookieTable({ rows }: { rows: readonly CookieRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Fornitore</th>
            <th>Finalità</th>
            <th>Durata</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td className="whitespace-nowrap font-medium">{row.name}</td>
              <td>{row.provider}</td>
              <td>{row.purpose}</td>
              <td className="whitespace-nowrap">{row.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function CookiePolicyPage() {
  const reader = createReader(".", keystaticConfig);
  const doc = await reader.singletons.cookiePolicy.read();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1>Cookie Policy</h1>

          {doc?.intro ? <p>{doc.intro}</p> : null}

          <h2>In breve</h2>
          <ul>
            <li>
              Il sito non installa cookie di tracciamento senza il tuo consenso:
              analisi e pubblicità sono gestiti in base alle scelte espresse nel
              messaggio di consenso.
            </li>
            <li>
              Le scelte si esprimono dal messaggio (Consenti / Non consentire /
              Gestisci opzioni) e possono essere modificate in qualsiasi momento
              dal link &laquo;Preferenze privacy&raquo; nel footer.
            </li>
            <li>
              Rifiutare il consenso non pregiudica la navigazione: manuale,
              materiali e download restano pienamente utilizzabili.
            </li>
          </ul>

          {(doc?.groups ?? []).map((group) => (
            <section key={group.title}>
              <h2>{group.title}</h2>
              {group.description ? <p>{group.description}</p> : null}
              {group.cookies.length > 0 ? (
                <CookieTable rows={group.cookies} />
              ) : null}
            </section>
          ))}

          <h2>Come cambiare le tue scelte</h2>
          <p>
            Il link &laquo;Preferenze privacy&raquo; nel footer di ogni pagina
            riapre il pannello di gestione di Google: puoi ritirare o modificare
            il consenso in ogni momento, con lo stesso identico meccanismo con
            cui l&apos;hai concesso. In alternativa puoi cancellare i cookie del
            dominio dalle impostazioni del browser.
          </p>

          <h2>Elenco dei fornitori</h2>
          <ul>
            <li>
              <strong>Google Ireland Ltd</strong> — gestione del consenso
              (Privacy &amp; messaging), misurazione (Analytics) e pubblicità
              (AdSense), queste ultime due solo dopo consenso.
            </li>
            <li>
              <strong>Vercel Inc.</strong> — hosting e distribuzione del sito.
            </li>
          </ul>

          <p className="text-sm text-fd-muted-foreground">
            Ultimo aggiornamento: settembre 2026. Le durate dei cookie di terze
            parti sono indicative: i fornitori possono aggiornarle
            indipendentemente (vedi le policy linkate nelle singole sezioni).
          </p>
        </article>
        <p className="mt-8 text-sm">
          <Link href="/" className="text-dw hover:underline">
            ← Torna alla home
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}