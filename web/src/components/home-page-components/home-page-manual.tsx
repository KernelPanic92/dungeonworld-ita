import { HomePageSection } from "./home-page-section";
import { FC } from "react";
import Image from "next/image";
import liliastre from "../../../public/images/pages/homepage/maga.webp";
import { ButtonLink } from "../button-link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

export const HomePageManual: FC = () => {
  return (
    <HomePageSection>
      <div className="flex flex-col-reverse xl:flex-row gap-24 items-center">
        <div className="flex flex-col flex-2">
          <h3 className="text-2xl font-bold text-dw uppercase mb-5">
            Manuale in italiano
          </h3>
          <p>
            Consulta il <strong>Manuale di Dungeon World in italiano</strong>, la
            risorsa definitiva per i giocatori di ruolo italiani, con
            una guida al gioco che copre tutte le regole fondamentali per
            iniziare subito a giocare.
          </p>

          <p>
            Sfrutta le appendici e gli indici, approfondisci le descrizioni delle classi di personaggi, consulta
            il bestiario per creare sfide emozionanti e arricchisci il tuo gioco
            con equipaggiamenti vari.
          </p>

          <p className="pb-10">
            Vai e inizia la tua epica avventura!
          </p>

          <ButtonLink href={"/manuale"}>
            Vai al manuale {" "}
            <FontAwesomeIcon icon={faArrowRight} width={12} />
          </ButtonLink>
        </div>
        <Image
          className="mx-auto xl:mx-0"
          src={liliastre}
          alt=""
          loading="lazy"
          width={383.5}
          height={575}
        />
      </div>
    </HomePageSection>
  );
};
