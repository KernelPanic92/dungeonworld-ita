import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HomePageSection } from "./home-page-section";

function FaqItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <AccordionItem>
      <AccordionTrigger className="text-base font-bold py-5">
        {title}
      </AccordionTrigger>
      <AccordionContent className="pb-6">
        <div className="flex flex-col gap-4 text-base">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

const linkClass = "text-dw underline-offset-4 hover:underline";

export function HomeFaq() {
  return (
    <HomePageSection>
      <div className="flex flex-col w-full">
        <h3 className="text-2xl font-bold text-dw uppercase mb-5">FAQ</h3>
        <p>
          Hai domande su Dungeon World? Abbiamo raccolto le risposte alle
          principali curiosità di chi si avvicina per la prima volta a questo
          fantastico gioco di ruolo! Scopri come iniziare, crea avventure epiche
          e immergiti nel mondo di Dungeon World con facilità. Dai
          un&apos;occhiata alle nostre FAQ per saperne di più!
        </p>

        <div className="mt-12">
          <Accordion>
            <FaqItem title="Che cos'è Dungeon World?">
              <p>
                Dungeon World è un gioco di ruolo fantasy Powered by the
                Apocalypse (PbtA) che unisce la narrativa collaborativa con
                elementi classici dei giochi di ruolo tradizionali, favorendo
                una narrazione fluida ed emergente grazie a regole semplici e
                coinvolgenti. Adatto a principianti ed esperti, si concentra
                sulla creazione di storie epiche attraverso l&apos;interazione
                tra i giocatori e il Master.
              </p>
            </FaqItem>

            <FaqItem title="Perché dovrei giocare a Dungeon World?">
              <p>
                In Dungeon World, dimentica turni, round e regole rigide su chi
                deve parlare. Qui, il gioco si sviluppa in modo naturale,
                seguendo il ritmo spontaneo della conversazione (fiction), con
                un flusso continuo di azione e reazione.
              </p>
              <p>
                Ogni scena è un momento di pura immersione, senza pause per
                preparare plance, tirare iniziative o spostare pedine.
                L&apos;azione scorre senza interruzioni, trascinandoti
                completamente nella storia.
              </p>
              <p>
                E i mostri? Non sono semplici sacchi pieni di PF da abbattere.
                Sono creature vive, con desideri, paure e debolezze, che portano
                una vera minaccia non solo per la loro forza, ma per il loro
                impatto sulla narrazione stessa. Ogni incontro diventa così
                un&apos;esperienza dinamica e indimenticabile, dove ogni scelta
                conta davvero!
              </p>
              <p>
                Ecco come lo presenta proprio Adam Koebel, coprogettista del
                gioco:
              </p>
              <blockquote className="p-4 border-s-4 border-neutral-600 bg-neutral-800/50">
                <p className="text-xl italic font-medium leading-relaxed">
                  Alle persone abituate ad altri giochi di ruolo, di solito
                  chiedo: «Raccontami dell&apos;ultima volta che hai giocato ad
                  AD&amp;D / Pathfinder / D&amp;D 4E», e poi li ascolto mentre
                  ricordano.
                  <br />
                  <br />
                  Mi raccontano della loro fantastica avventura: nemici sconfitti
                  con noncuranza, salti rocamboleschi su precipizi, e
                  quell&apos;idea geniale dell&apos;ultimo minuto che ha salvato
                  il gruppo.
                  <br />
                  <br />
                  Quando hanno finito, gli faccio notare che non si sono
                  ricordati le regole, ma ciò che è avvenuto durante il gioco ai
                  personaggi. Si ricordano la fiction, gli eventi, la storia.
                  <br />
                  <br />
                  Poi gli dico: «Vi va di provare un gioco che vi dà queste
                  senzazioni anche durante la partita, e non solo dopo?» e da lì
                  è una strada in discesa.
                </p>
              </blockquote>
            </FaqItem>

            <FaqItem title="Perché scegliere Dungeon World invece di altri GDR?">
              <p>
                A differenza dei giochi di ruolo tradizionali, che spesso
                richiedono sistemi complessi, lunghi preparativi e la lettura di
                numerosi manuali, Dungeon World si concentra sulla facilità
                d&apos;uso, sulla velocità e sull&apos;adattabilità. Le sue
                regole semplici e l&apos;approccio fiction first permettono ai
                giocatori di concentrarsi sulla storia e sull&apos;interazione,
                favorendo una narrazione fluida e collaborativa senza
                interrompere continuamente il gioco per consultare le regole.
              </p>
            </FaqItem>

            <FaqItem title="Posso creare campagne lunghe come quelle di altri sistemi?">
              <p>
                Dungeon World è perfetto sia per campagne lunghe e articolate,
                sia per sessioni one-shot, proprio come altri sistemi di gioco!
              </p>
              <p>
                Anche se il sistema è progettato per essere rapido e fluido, la
                struttura narrativa, i fronti del GM e la profondità dei
                personaggi permettono di sviluppare storie epiche che si
                evolvono nel tempo.
              </p>
              <p>
                I legami tra i personaggi, gli sviluppi del mondo di gioco e le
                conseguenze delle azioni dei giocatori contribuiscono a creare
                una campagna che può durare per mesi o persino anni, mantenendo
                sempre alto l&apos;interesse e la coinvolgente esperienza di
                gioco.
              </p>
            </FaqItem>

            <FaqItem title="Di cosa ho bisogno per giocare a Dungeon World?">
              <ul className="list-disc pl-6">
                <li>Un gruppo di amici (di solito 3-5 giocatori più un Master)</li>
                <li>
                  La tua scheda scaricata dai{" "}
                  <Link href="/materiali" className={linkClass}>
                    Materiali
                  </Link>
                </li>
                <li>Carta, penna, 2 D6 e il dado del danno della tua scheda</li>
              </ul>
            </FaqItem>

            <FaqItem title="Come si crea un personaggio in Dungeon World?">
              <p>
                Creare personaggi di Dungeon World è facile e veloce! Scarica la
                scheda che più ti piace dai{" "}
                <Link href="/materiali" className={linkClass}>
                  Materiali
                </Link>{" "}
                e visita la sezione{" "}
                <Link href="/manuale/creazione-personaggi" className={linkClass}>
                  Creazione dei Personaggi
                </Link>
                ! Dovreste creare i personaggi tutti insieme all&apos;inizio
                della prima sessione. La creazione del personaggio è, come il
                gioco stesso, un tipo di conversazione: tutti dovrebbero essere
                presenti.
              </p>
            </FaqItem>

            <FaqItem title="Dungeon World è adatto ai principianti?">
              <p>
                Assolutamente sì! Dungeon World è stato progettato per essere
                accessibile a tutti, anche a chi non ha mai giocato a un gioco
                di ruolo prima d&apos;ora. Il sistema di gioco è intuitivo e
                incoraggia la creatività.
              </p>
            </FaqItem>

            <FaqItem title="Qual è il ruolo del Master in Dungeon World?">
              <p>
                Il Master (o GM, Game Master) è colui che guida la storia,
                descrive il mondo e i suoi abitanti, e reagisce alle azioni dei
                giocatori. Anche se ha il controllo della narrazione, il Master
                collabora con i giocatori per costruire una storia condivisa. Se
                sei interessato a fare il Master, visita la sezione del{" "}
                <Link href="/manuale/game-master/gm" className={linkClass}>
                  GM
                </Link>
                .
              </p>
            </FaqItem>

            <FaqItem title="Quanto dura una sessione di gioco?">
              <p>
                Una sessione di Dungeon World può durare da 2 a 4 ore, ma la
                durata può variare in base al gruppo. Alcune avventure possono
                richiedere più sessioni per essere completate.
              </p>
            </FaqItem>

            <FaqItem title="È possibile giocare a Dungeon World online?">
              <p>
                Sì, Dungeon World può essere facilmente giocato online
                utilizzando piattaforme come Roll20, Discord o altri strumenti
                di gioco di ruolo virtuale!
              </p>
            </FaqItem>

            <FaqItem title="Esiste una Lore o un'ambientazione già pronta?">
              <p>
                A differenza di altri sistemi, in Dungeon World la lore viene
                creata insieme ai giocatori, aumentando il coinvolgimento e
                rendendo ogni campagna unica. Questo approccio ti permette di
                costruire un mondo che si evolve con le scelte dei giocatori.
                Tuttavia, se preferisci partire da una base già esistente, puoi
                arricchire il gioco con ambientazioni e avventure create dalla
                community, disponibili per un&apos;esperienza ancora più
                immersiva.
              </p>
            </FaqItem>

            <FaqItem title="Dove posso trovare avventure o moduli predefiniti per Dungeon World?">
              <p>
                Oltre al manuale base, esistono molte avventure e moduli creati
                dalla comunità. Puoi trovarli nella sezione{" "}
                <Link href="/materiali?source=homebrew" className={linkClass}>
                  Materiali Homebrew
                </Link>
                , o su piattaforme dedicate come itch.io e DriveThruRPG.
              </p>
            </FaqItem>

            <FaqItem title="Posso creare e condividere i miei contenuti per Dungeon World?">
              <p>
                Certamente! Dungeon World è supportato da una vivace comunità di
                giocatori e creatori. Se hai creato una nuova classe,
                un&apos;avventura, o qualsiasi altro contenuto, puoi
                condividerlo con la comunità contribuendo al repository FOSS di
                questo progetto o altre piattaforme di condivisione.
              </p>
            </FaqItem>

            <FaqItem title="Dungeon World è compatibile con altri giochi di ruolo?">
              <p>
                Dungeon World ha un sistema unico basato sulle mosse, ma puoi
                adattare o integrare contenuti da altri giochi di ruolo, puoi
                trovare un&apos;intera appendice a riguardo in{" "}
                <Link href="/manuale/appendici/adattare-avventure" className={linkClass}>
                  Adattare Avventure
                </Link>
                !
              </p>
            </FaqItem>
          </Accordion>
        </div>
      </div>
    </HomePageSection>
  );
}
