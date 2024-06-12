import clsx from "clsx";
import { Link } from "nextra-theme-docs";
import { FC } from "react";
import Image from "next/image";
import { Metal_Mania } from "next/font/google";
import cover from "../../../public/images/dungeon-world-cover.webp";

const metalMania = Metal_Mania({
    weight: "400",
    preload: true,
    subsets: ["latin"],
});
  
export const Cover: FC = () => {
    return (
      <div className="w-full mx-auto max-w-[90rem] md:pl-[max(env(safe-area-inset-left),1.5rem)] md:pr-[max(env(safe-area-inset-right),1.5rem)]">
        <div className="relative h-96 md:h-[832px]">
          <Image
            priority
            src={cover}
            className="object-center object-cover"
            alt="Immagine di sfondo"
            fill
          ></Image>
          <div className="absolute flex flex-col justify-center items-center inset-0 bg-gradient-to-t from-[#4d060680] from-60%">
            <h1 className={clsx(metalMania.className, "text-center text-4xl sm:text-5xl md:text-6xl lg:text-8xl text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]")}>
              Dungeon World
            </h1>
            <h2 className={clsx(metalMania.className, "text-center text-xl sm:text-xl md:text-2xl lg:text-4xl md:pt-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]")}>
              Gioca Per Scoprire Cosa Succede
            </h2>
            <Link href="/manuale">
              <button className="bg-dw drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] hover:bg-dw-700 text-white font-bold py-2 px-4 w-28 h-10 mt-5 rounded-full text-sm uppercase">
                Iniziamo!
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  };