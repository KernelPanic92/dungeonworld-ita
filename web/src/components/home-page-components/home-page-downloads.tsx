import { dungeonWorldData } from "@/data/dungeon-world";
import { HomePageSection } from "./home-page-section";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Asset } from "../asset";
import { ButtonLink } from "../button-link";

export const HomePageDownloads = () => {
  const assets = [
    dungeonWorldData.standard.frontsSummary,
    dungeonWorldData.standard.gameMasterSummary,
    dungeonWorldData.standard.movesSummary,
    ...dungeonWorldData.standard.classes.flatMap(c => c.assets)
  ];

  return (
    <HomePageSection>
      <h3 className="text-2xl font-bold text-dw uppercase mb-5">
        Materiali Scaricabili
      </h3>
      <p>
        Sfrutta la sezione <strong>Materiali Scaricabili</strong>, il luogo dove puoi recuperare tutte le risorse disponibili per Dungeon World, sia standard che homebrew. Questa sezione è stata creata per offrire ai giocatori un accesso facile e immediato ai materiali contenuti nel sito.
    </p>

      <div className="flex overflow-x-scroll pt-2 scrollbar-hide w-full">
        <div className="flex flex-nowrap">
          {assets.map((asset) => <Asset key={asset.url} asset={asset}/>)}
        </div>
      </div>
      <ButtonLink href={"/materiali"}>
        Vai ai materiali {" "}
        <FontAwesomeIcon icon={faArrowRight} width={12} />
      </ButtonLink>
    </HomePageSection>
  );
};
