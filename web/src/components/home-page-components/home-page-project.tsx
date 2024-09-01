import { HomePageSection } from "./home-page-section";
import { ButtonLink } from "../button-link";

export const HomePageProject = () => {
  return (
    <HomePageSection>
      <div className="flex flex-col">
        <h3 className="text-2xl font-bold text-dw uppercase mb-5">
          Il progetto
        </h3>
        <p className="pb-10">
          L'obiettivo principale di questo progetto è quello di offrire una
          traduzione completa e accurata di Dungeon World e di tutte le opere
          gratuite derivate, creando un punto di accesso unico e facilmente
          consultabile per tutti gli appassionati di questo gioco. Crediamo che
          ogni appassionato meriti di avere accesso a strumenti di gioco ben
          tradotti e facilmente reperibili. Con la nostra piattaforma, puntiamo
          a soddisfare questa esigenza e a fornire un servizio utile e gratuito
          alla comunità.
        </p>
        <ButtonLink href={"/altro/progetto"}>
          Scopri il progetto
        </ButtonLink>
      </div>
    </HomePageSection>
  );
};
