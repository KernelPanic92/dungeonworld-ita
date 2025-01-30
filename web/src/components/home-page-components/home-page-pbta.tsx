import { HomePageSection } from "./home-page-section";
import { FC } from "react";
import Image from "next/image";
import pbta from "../../../public/images/pages/homepage/powered-by-the-apocalypse.webp";
import { Link } from "nextra-theme-docs";

export const HomePagePbta: FC = () => {
  return (
    <HomePageSection>
      <div className="flex flex-col xl:flex-row gap-24 items-center">
        <Image
          className="mx-auto xl:mx-0"
          src={pbta}
          alt="Immagine powered by the apocalypse"
          loading="lazy"
          width={383.5}
          height={575}
        />

        <div className="flex flex-col flex-1 xl:text-right">
          <h3 className="text-2xl font-bold text-dw uppercase mb-5">
            Powered by the Apocalypse
          </h3>
          <p>
            Dungeon World è un gioco di ruolo{" "}
            <Link href="https://apocalypse-world.com/pbta/policy">
              Powered by the Apocalypse (PbtA)
            </Link>
            , un sistema che promuove una narrazione emergente e collaborativa,
            ispirato a{" "}
            <Link href="https://apocalypse-world.com">
              Apocalypse World di D. Vincent e Meguey Baker
            </Link>
            .{" "}
          </p>
          <p>
            I giochi PbtA sono caratterizzati da meccaniche fiction first,
            semplici ma profonde, per creare storie avvincenti, offrendo
            un'esperienza unica, coinvolgente e immersiva.
          </p>
        </div>
      </div>
    </HomePageSection>
  );
};
