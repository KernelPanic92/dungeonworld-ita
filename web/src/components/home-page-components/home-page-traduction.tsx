import { Link } from "nextra-theme-docs";
import { HomePageSection } from "./home-page-section";

export const HomePageTraduction = () => {
    return <HomePageSection>
    <h3 className="text-xl sm:2xl md:text-3xl font-bold text-dw uppercase">La traduzione italiana</h3>
    <p>
      Benvenuti alla{" "}
      <b>
        traduzione italiana di{" "}
        <Link href="https://www.dungeon-world.com" target="_blank">
          Dungeon World
        </Link>
      </b>
      , il gioco di ruolo di{" "}
      <Link href="https://www.adam-koebel.com" target="_blank">
        Adam Koebel
      </Link>{" "}
      e{" "}
      <Link href="https://www.latorra.org/" target="_blank">
        Sage Latorra
      </Link>
      , vincitore del premio <b>Best Rules</b> agli ENnies 2013! Dungeon
      World è derivato dal Mondo dell'Apocalisse di Vincent Baker: Adam e
      Sage hanno preso il sistema di Baker e l'hanno adattato, superando
      l'originale in popolarità e successo, a un'estetica fantasy simile a
      quella proposta dai più popolari giochi di ruolo in commercio.
    </p>
    <p>
      <b>
        Ecco come lo presenta proprio Adam Koebel, coprogettista del gioco:
      </b>
    </p>
    <blockquote>
      Alle persone abituate ad altri giochi di ruolo, di solito chiedo:
      «Raccontami dell'ultima volta che hai giocato ad AD&D / Pathfinder /
      D&D 4E, e poi li ascolto mentre ricordano. Mi raccontano della loro
      <b>fantastica avventura</b>: nemici sconfitti con noncuranza, salti
      rocamboleschi su precipizi, e quell'idea geniale dell'ultimo minuto
      che ha salvato il gruppo. Quando hanno finito, gli faccio notare che
      non si sono ricordati le regole, ma ciò che è{" "}
      <b>avvenuto durante il gioco</b> ai personaggi. Si ricordano la{" "}
      <i>fiction</i>, gli eventi, la storia. Poi gli dico: «Vi va di provare
      un gioco che vi dà queste sensazioni <b>anche durante la partita</b>,
      e non solo dopo?» e da lì è una strada in discesa.
    </blockquote>
    <h4 className="text-xl sm:2xl md:text-3xl font-bold text-dw uppercase">Perché una traduzione?</h4>
    <p>
      Ho deciso di fare questa traduzione per aiutare a diffondere Dungeon
      World nel mio paese natìo, l'Italia. Il lavoro è indipendente e
      anteriore a quello effettuato da{" "}
      <Link href="https://www.narrattiva.it" target="_blank">
        Narrattiva
      </Link>{" "}
      (con cui non siamo associati) e si pone come alternativa gratuitamente
      consultabile online. Qui{" "}
      <Link href="/altro/glossario-differenze">
        Il glossario delle differenze
      </Link>{" "}
      con la loro edizione di Dungeon World.
    </p>
  </HomePageSection>;
}