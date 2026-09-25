import Image from "next/image";
import torben from "../../../public/images/pages/homepage/berserker.webp";
import { ButtonLink } from "./button-link";
import { HomePageSection } from "./home-page-section";

export function HomeHomebrew() {
  return (
    <HomePageSection>
      <div className="flex flex-col xl:flex-row gap-24 items-center">
        <Image
          className="mx-auto xl:mx-0"
          src={torben}
          alt="Immagine homebrew"
          loading="lazy"
          width={383.5}
          height={575}
        />

        <div className="flex flex-col flex-1 xl:text-right">
          <h3 className="text-2xl font-bold text-dw uppercase mb-5">
            Materiali Homebrew
          </h3>
          <p>
            Esplora la creatività della community con contenuti unici e
            originali.
          </p>

          <p>
            Nella sezione Materiali ci sono <b>Classi</b>, <b>Ambientazioni</b>,{" "}
            <b>Campagne</b>, <b>One Shot</b>, <b>Equipaggiamenti</b> e{" "}
            <b>Mostri</b> per arricchire le tue avventure. Ogni contributo è
            tradotto in italiano per garantirne l&apos;accessibilità a tutti.
          </p>

          <p className="pb-10">
            Scopri le innumerevoli possibilità che la community di Dungeon World
            ha da offrire!
          </p>
          <div className="flex flex-row xl:flex-row-reverse">
            <ButtonLink href="/materiali?source=homebrew">
              Vai ai materiali homebrew
            </ButtonLink>
          </div>
        </div>
      </div>
    </HomePageSection>
  );
}
