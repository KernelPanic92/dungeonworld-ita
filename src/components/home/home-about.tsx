import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreativeCommons } from "@fortawesome/free-brands-svg-icons";
import {
  faComments,
  faDragon,
  faRotate,
  faToolbox,
  faTrophy,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { HomePageSection } from "./home-page-section";

function AboutItem({
  icon,
  title,
  description,
}: {
  icon: IconDefinition;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-y-5 items-center">
      <FontAwesomeIcon icon={icon} className="size-15 text-dw" />
      <h4 className="text-center text-2xl font-bold text-dw">{title}</h4>
      <p className="text-center text-xl">{description}</p>
    </div>
  );
}

export function HomeAbout() {
  return (
    <HomePageSection>
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-x-24 gap-y-20">
        <AboutItem
          title="Classica Avventura Fantasy"
          description="Esplora una terra di magia e pericolo nei panni di avventurieri alla ricerca di fama, oro e gloria. Dungeon World prende il fantasy classico e si avvicina con nuove regole."
          icon={faDragon}
        />
        <AboutItem
          title="Kit Per Il Game Master"
          description="Fare il Master non dovrebbe essere un peso. DW dà tutti gli strumenti per gestire le sessioni in modo rapido e semplice: i fronti rendono il mondo intorno ai giocatori vivo e in evoluzione, le mosse portano avanti la storia e la tua agenda ti tiene in pista."
          icon={faToolbox}
        />
        <AboutItem
          title="Senza Vicoli Ciechi"
          description="Le regole guidano sempre l'azione in avanti in modi inaspettati. Lanciare i dadi porta sempre a un risultato interessante."
          icon={faRotate}
        />
        <AboutItem
          title="Design Pluripremiato"
          description="Dungeon World ha vinto un Ennie per le migliori regole, un Golden Geek per il miglior RPG, e un Indie RPG Award."
          icon={faTrophy}
        />
        <AboutItem
          title="Parla Di Ciò Che Conta"
          description="Le regole di Dungeon World sono semplici e si basano su ciò che accade all'interno del gioco, quindi passi più tempo a parlare dell'azione e meno a parlare delle regole."
          icon={faComments}
        />
        <AboutItem
          title="Creative Commons"
          description="Il manuale originale di Dungeon World è rilasciato sotto licenza Creative Commons Attribution. Puoi creare, distribuire e persino vendere tutto ciò che vuoi che sia basato su Dungeon World."
          icon={faCreativeCommons}
        />
      </div>
    </HomePageSection>
  );
}
