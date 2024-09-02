import { Accordion, AccordionItem } from "../accordion";
import { HomePageSection } from "./home-page-section";
import { Link } from "nextra-theme-docs";

export const HomePageFAQ = () => (
  <HomePageSection>
    <div className="flex flex-col w-full">
      <h3 className="text-2xl font-bold text-dw uppercase mb-5">
        FAQ
      </h3>
      <p>Hai domande su Dungeon World? Abbiamo raccolto le risposte alle principali curiosità di chi si avvicina per la prima volta a questo fantastico gioco di ruolo! Scopri come iniziare, crea avventure epiche e immergiti nel mondo di Dungeon World con facilità. Dai un'occhiata alle nostre FAQ per saperne di più!</p>

      <div className="mt-12">
      <Accordion>
        <AccordionItem title="Che cos'è Dungeon World?"> 
            Dungeon World è un gioco di ruolo fantasy che combina la narrativa collaborativa con elementi classici dei giochi di ruolo tradizionali. È accessibile sia ai principianti che ai giocatori esperti e si concentra sulla creazione di storie epiche attraverso l'interazione tra i giocatori e il Master.
        </AccordionItem>

        <AccordionItem title="Perché dovrei giocare a Dungeon World?">
            <p>In Dungeon World, dimentica turni, round e regole rigide su chi deve parlare. Qui, il gioco si sviluppa in modo naturale, seguendo il ritmo spontaneo della conversazione (fiction), con un flusso continuo di azione e reazione.</p>
            <br/>
            <p>Ogni scena è un momento di pura immersione, senza pause per preparare plance, tirare iniziative o spostare pedine. L'azione scorre senza interruzioni, trascinandoti completamente nella storia.</p>
            <br/>
            <p>E i mostri? Non sono semplici sacchi pieni di PF da abbattere. Sono creature vive, con desideri, paure e debolezze, che portano una vera minaccia non solo per la loro forza, ma per il loro impatto sulla narrazione stessa. Ogni incontro diventa così un’esperienza dinamica e indimenticabile, dove ogni scelta conta davvero!</p>
            <br/>
            <p>Ecco come lo presenta proprio Adam Koebel, coprogettista del gioco:</p>
            <br/>
            <blockquote className="p-4 my-4 border-s-4 border-gray-300 bg-gray-50 dark:border-gray-500 dark:bg-gray-800">
                <p className="text-xl italic font-medium leading-relaxed text-gray-900 dark:text-white">
                    Alle persone abituate ad altri giochi di ruolo, di solito chiedo: «Raccontami dell’ultima volta che hai giocato ad AD&D / Pathfinder / D&D 4E», e poi li ascolto mentre ricordano.
                    <br/><br/>
                    Mi raccontano della loro fantastica avventura: nemici sconfitti con noncuranza, salti rocamboleschi su precipizi, e quell’idea geniale dell’ultimo minuto che ha salvato il gruppo. 
                    <br/><br/>
                    Quando hanno finito, gli faccio notare che non si sono ricordati le regole, ma ciò che è avvenuto durante il gioco ai personaggi. Si ricordano la fiction, gli eventi, la storia.
                    <br/><br/>
                    Poi gli dico: «Vi va di provare un gioco che vi dà queste senzazioni anche durante la partita, e non solo dopo?» e da lì è una strada in discesa.
                </p>
            </blockquote>
        </AccordionItem>

        <AccordionItem title="Posso creare campagne lunghe come quelle di altri sistemi?">
            Dungeon World è perfetto sia per campagne lunghe e articolate, sia per sessioni one-shot, proprio come altri sistemi di gioco!  
            <br/>
            <br/>
            Anche se il sistema è progettato per essere rapido e fluido, la struttura narrativa, i fronti del GM e la profondità dei personaggi permettono di sviluppare storie epiche che si evolvono nel tempo.
            <br/>
            <br/>
            I legami tra i personaggi, gli sviluppi del mondo di gioco e le conseguenze delle azioni dei giocatori contribuiscono a creare una campagna che può durare per mesi o persino anni, mantenendo sempre alto l'interesse e la coinvolgente esperienza di gioco.
        </AccordionItem>

        <AccordionItem title="Di cosa ho bisogno per giocare a Dungeon World?">
            <ul className="list-disc pl-6">
                <li>Un gruppo di amici (di solito 3-5 giocatori più un Master)</li>
                <li>La tua scheda scaricata dai{" "}<Link href="materiali">Materiali</Link></li>
                <li>Carta, penna, 2 D6 e il dado del danno della tua scheda</li>
            </ul>
        </AccordionItem>

        <AccordionItem title="Come si crea un personaggio in Dungeon World?">
            Creare personaggi di Dungeon World è facile e veloce!
            Scarica la scheda che più ti piace dai{" "}<Link href="/materiali">Materiali</Link>{" "}
            e visita la sezione{" "}<Link href="/manuale/creazione-personaggi">Creazione dei Personaggi</Link>!
            Dovreste creare i personaggi tutti insieme all'inizio della prima sessione.
            La creazione del personaggio è, come il gioco stesso, un tipo di conversazione: tutti dovrebbero essere presenti.
        </AccordionItem>

        <AccordionItem title="Dungeon World è adatto ai principianti?">
            Assolutamente sì! Dungeon World è stato progettato per essere accessibile a tutti, anche a chi non ha mai giocato a un gioco di ruolo prima d'ora. Il sistema di gioco è intuitivo e incoraggia la creatività.
        </AccordionItem>
        
        <AccordionItem title="Qual è il ruolo del Master in Dungeon World?">
            Il Master (o GM, Game Master) è colui che guida la storia, descrive il mondo e i suoi abitanti, e reagisce alle azioni dei giocatori.
            Anche se ha il controllo della narrazione, il Master collabora con i giocatori per costruire una storia condivisa. Se sei interessato a fare il Master, visita la sezione del{" "}<Link href="manuale/game-master/gm">GM</Link>
        </AccordionItem>
        
        <AccordionItem title="Quanto dura una sessione di gioco?">
            Una sessione di Dungeon World può durare da 2 a 4 ore, ma la durata può variare in base al gruppo. Alcune avventure possono richiedere più sessioni per essere completate.
        </AccordionItem>
        
        <AccordionItem title="È possibile giocare a Dungeon World online?">
            Sì, Dungeon World può essere facilmente giocato online utilizzando piattaforme come Roll20, Discord o altri strumenti di gioco di ruolo virtuale!
        </AccordionItem>

        <AccordionItem title="Esiste una Lore o un'ambientazione già pronta?">
        A differenza di altri sistemi, in Dungeon World la lore viene creata insieme ai giocatori, aumentando il coinvolgimento e rendendo ogni campagna unica. Questo approccio ti permette di costruire un mondo che si evolve con le scelte dei giocatori. Tuttavia, se preferisci partire da una base già esistente, puoi arricchire il gioco con ambientazioni e avventure create dalla community, disponibili per un'esperienza ancora più immersiva.
        </AccordionItem>
        
        <AccordionItem title="Dove posso trovare avventure o moduli predefiniti per Dungeon World?">
            Oltre al manuale base, esistono molte avventure e moduli creati dalla comunità. Puoi trovarli nella sezione{" "}<Link href="homebrew">Homebrew</Link>, o su piattaforme dedicate come itch.io e DriveThruRPG.
        </AccordionItem>
        
        <AccordionItem title="Posso creare e condividere i miei contenuti per Dungeon World?">
            Certamente! Dungeon World è supportato da una vivace comunità di giocatori e creatori.
            Se hai creato una nuova classe, un'avventura, o qualsiasi altro contenuto,
            puoi condividerlo con la comunità contribuendo al repository FOSS di questo progetto o altre piattaforme di condivisione.
        </AccordionItem>
        
        <AccordionItem title="Dungeon World è compatibile con altri giochi di ruolo?">
            Dungeon World ha un sistema unico basato sulle mosse,
            ma puoi adattare o integrare contenuti da altri giochi di ruolo,
            puoi trovare un'intera sezione a riguardo in{" "}<Link href="/manuale/game-master/avventure-avanzate">Avventure Avanzate</Link>!
        </AccordionItem>
      </Accordion>
      </div>
    </div>
  </HomePageSection>
);
