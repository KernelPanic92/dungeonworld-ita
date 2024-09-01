import { HomePageSection } from "./home-page-section";
import { FC } from "react";
import Image from "next/image";
import liliastre from "../../../public/images/pages/homepage/maga.webp";
import { ButtonLink } from "../button-link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "nextra-theme-docs";

export const HomePageManual: FC = () => {
  return (
    <HomePageSection>
      <div className="flex flex-col-reverse xl:flex-row gap-24 items-center">
        <div className="flex flex-col flex-2">
          <h3 className="text-2xl font-bold text-dw uppercase mb-5">
            Manuale in italiano
          </h3>
          <p>
          Consulta il <strong>Manuale di Dungeon World in italiano</strong>,
          la risorsa definitiva per i giocatori di ruolo.
          Se sei un giocatore, puoi limitarti a leggere <Link href='/manuale/come-giocare'>Come Giocare</Link>:
          la maggior parte delle cose saranno nella tua scheda personaggio.
          Come GM, leggi tutto, ma puoi rimandare la lettura dei mostri e del capitolo
          Avventure Avanzate a quando sarà necessario.
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
