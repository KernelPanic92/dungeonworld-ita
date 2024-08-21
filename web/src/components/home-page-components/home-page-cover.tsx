import clsx from "clsx";
import { FC } from "react";
import Image from "next/image";
import { Metal_Mania } from "next/font/google";
import sciamano from "../../../public/images/pages/homepage/sciamano.webp";

const metalMania = Metal_Mania({
  weight: "400",
  preload: true,
  subsets: ["latin"],
});

export const Cover: FC = () => {
  return (
    <div className="flex flex-col justify-center lg:justify-end relative w-full mx-auto max-w-[90rem] pl-[max(env(safe-area-inset-left),1.5rem)] pr-[max(env(safe-area-inset-right),1.5rem)] md:pl-40 md:pr-40 space-y-10">
      <div className="flex flex-row justify-center lg:justify-end relative w-full">
        <div className="absolute flex flex-col justify-center items-center lg:items-start inset-0">
          <h1 lang="en"  
            className={clsx(
              metalMania.className,
              "text-5xl sm:text-6xl text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
            )}
          >
            Dungeon World
          </h1>
          <h2
            className={clsx(
              metalMania.className,
              "text-xl sm:text-2xl lg:text-4xl md:pt-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
            )}
          >
            Gioca Per Scoprire Cosa Succede
          </h2>
        </div>
        <Image
          priority
          src={sciamano}
          alt=""
          height={600}
          width={421}
        ></Image>
      </div>
      <h3 className="text-center mx-auto text-lg font-bold">
        <span lang="en">Dungeon World</span> è un gioco di ruolo da tavolo. Raccogli alcuni amici e
        intraprendi l'avventura. Gioca per scoprire cosa succede!
      </h3>
    </div>
  );
};