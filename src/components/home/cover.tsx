import Image from "next/image";
import clsx from "clsx";
import { metalMania } from "@/lib/fonts";
import sciamano from "../../../public/images/pages/homepage/sciamano.webp";

export function Cover() {
  return (
    <section className="w-full bg-background">
      {/* same safe-area gutters as the legacy cover (md: 10rem each side),
          narrower than the other sections on purpose */}
      <div className="mx-auto flex w-full max-w-[90rem] flex-col items-center gap-8 py-10 pl-[max(env(safe-area-inset-left),1.5rem)] pr-[max(env(safe-area-inset-right),1.5rem)] md:pl-40 md:pr-40 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <h1
            lang="en"
            className={clsx(
              metalMania.className,
              "text-5xl sm:text-6xl text-foreground",
            )}
          >
            Dungeon World
          </h1>
          <h2
            className={clsx(
              metalMania.className,
              "text-xl sm:text-2xl lg:text-4xl text-foreground",
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
          className="w-full max-w-xs md:max-w-sm"
        />
      </div>
      <h3 className="mx-auto w-full max-w-[90rem] pb-8 pl-[max(env(safe-area-inset-left),1.5rem)] pr-[max(env(safe-area-inset-right),1.5rem)] text-center text-lg font-bold text-foreground md:pl-40 md:pr-40">
        <span lang="en">Dungeon World</span> è un gioco di ruolo da tavolo.
        Raccogli alcuni amici e intraprendi l&apos;avventura. Gioca per scoprire
        cosa succede!
      </h3>
    </section>
  );
}
