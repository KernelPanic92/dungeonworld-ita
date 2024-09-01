import { HomePageSection } from "./home-page-section";
import { FC } from "react";
import Image from "next/image";
import materiali from "../../../public/images/pages/homepage/materiali.webp";
import { ButtonLink } from "../button-link";

export const HomePageDownloads: FC = () => {
  return (
    <HomePageSection>
      <div className="flex flex-col-reverse xl:flex-row gap-24 items-center">
        <div className="flex flex-col flex-2">
          <h3 className="text-2xl font-bold text-dw uppercase mb-5">
            Materiali Scaricabili
          </h3>
          <p>
          Sfrutta la sezione <strong>Materiali Scaricabili</strong>, il luogo
          dove puoi recuperare tutte le risorse disponibili per Dungeon World,
          sia standard che homebrew. Questa sezione è stata creata per offrire
          ai giocatori un accesso facile e immediato ai materiali contenuti nel
          sito.
        </p>

          <p className="pb-10">
            Vai e inizia la tua epica avventura!
          </p>

          <ButtonLink href={"/materiali"}>
            Vai ai Materiali
          </ButtonLink>
        </div>
        <Image
          className="mx-auto xl:mx-0"
          src={materiali}
          alt=""
          loading="lazy"
          width={383.5}
          height={575}
        />
      </div>
    </HomePageSection>
  );
};
