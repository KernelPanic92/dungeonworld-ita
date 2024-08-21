import { FC, PropsWithChildren } from "react";
import { HomePageSection } from "./home-page-section";
import {
  faDragon,
  faToolbox,
  faComments,
  faRotate,
  faTrophy,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreativeCommons } from "@fortawesome/free-brands-svg-icons";

export interface HomePageAboutItemProps {
  icon: IconDefinition;
  title: string;
  description: string;
}

export const HomePageAboutItem: FC<HomePageAboutItemProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="flex flex-col gap-y-5 items-center">
      <FontAwesomeIcon icon={icon} className="w-[3.75rem] h-[3.75rem] text-dw" />
      <h4 className="text-center text-2xl font-bold text-dw">{title}</h4>
      <p className="text-center text-xl">{description}</p>
    </div>
  );
};

export const HomePageAbout = () => {
  return (
    <HomePageSection>
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-x-24 gap-y-20">
        <HomePageAboutItem
          title="Classica Avventura Fantasy"
          description="Esplora una terra di magia e pericolo nei panni di avventurieri alla ricerca di fama, oro e gloria. Dungeon World prende il fantasy classico e si avvicina con nuove regole."
          icon={faDragon}
        />
        <HomePageAboutItem
          title="Kit Per Il Game Master"
          description="Fare il Master non dovrebbe essere un peso. DW dà tutti gli strumenti per gestire le sessioni in modo rapido e semplice: i fronti rendono il mondo intorno ai giocatori vivo e in evoluzione, le mosse portano avanti la storia e la tua agenda ti tiene in pista."
          icon={faToolbox}
        />
        <HomePageAboutItem
          title="Senza Vicoli Ciechi"
          description="Le regole guidano sempre l'azione in avanti in modi inaspettati. Lanciare i dadi porta sempre a un risultato interessante."
          icon={faRotate}
        />
        <HomePageAboutItem
          title="Design Pluripremiato"
          description="Dungeon World ha vinto un Ennie per le migliori regole, un Golden Geek per il miglior RPG, e un Indie RPG Award."
          icon={faTrophy}
        />
        <HomePageAboutItem
          title="Parla Di Ciò Che Conta"
          description="Le regole di Dungeon World sono semplici e si basano su ciò che accade all'interno del gioco, quindi passi più tempo a parlare dell'azione e meno a parlare delle regole."
          icon={faComments}
        />
        <HomePageAboutItem
          title="Creative Commons"
          description="Il testo di Dungeon World è rilasciato sotto licenza Creative Commons Attribution. Puoi creare, distribuire e persino vendere tutto ciò che vuoi che sia basato su Dungeon World."
          icon={faCreativeCommons}
        />
      </div>
    </HomePageSection>
  );
};
