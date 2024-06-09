import { FC, PropsWithChildren } from "react";
import Image from "next/image";
import { Metal_Mania } from "next/font/google";
import clsx from "clsx";
import { Link } from "nextra-theme-docs";

const metalMania = Metal_Mania({
  weight: "400",
  preload: true,
  subsets: ["latin"],
});

export const Cover: FC = () => {
  return (
    <div className="max-w-[90rem] pl-[max(env(safe-area-inset-left),1.5rem)] pr-[max(env(safe-area-inset-right),1.5rem)]">
      <div className="relative h-96 md:h-[41rem]">
        <Image
          priority
          src="/images/dungeon-world-cover.jpeg"
          className="object-top object-cover"
          alt="Immagine di sfondo"
          fill
        ></Image>
        <div className="absolute flex flex-col justify-center p-5 md:p-20 inset-0">
          <h1 className={clsx(metalMania.className, "text-2xl sm:text-4xl md:text-6xl text-dw drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]")}>
            Dungeon World
          </h1>
          <h2 className={clsx(metalMania.className, "text-1xl sm:text-2xl md:text-4xl md:pt-4 text-dw drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]")}>
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

export const HomePageSection: FC<
  PropsWithChildren & { alternative?: boolean }
> = ({ children, alternative }) => {
  return (
    <div
      className={clsx(
        "flex flex-col gap-y-5 max-w-[90rem] items-center justify-center py-[1.5rem] pl-[max(env(safe-area-inset-left),1.5rem)] pr-[max(env(safe-area-inset-right),1.5rem)] sm:pl-[max(env(safe-area-inset-left),5.5rem)] sm:pr-[max(env(safe-area-inset-right),5.5rem)]",
        [{ "dark:bg-neutral-900 bg-gray-100": alternative }]
      )}
    >
      {children}
    </div>
  );
};

export const HomePage: FC = () => {
  return (
    <div className="flex flex-col gap-y-10 pt-10 pb-10">
      <Cover />
      <HomePageSection>
        <p className="text-center">
          Dungeon World è un gioco di ruolo da tavolo. Raccogli alcuni amici e
          intraprendi l'avventura. Gioca per scoprire cosa succede!
        </p>
      </HomePageSection>
      <HomePageSection>
        <h3 className="text-4xl font-bold text-dw uppercase">La traduzione italiana</h3>
        <p>
          Benvenuti alla{" "}
          <b>
            traduzione italiana di{" "}
            <Link href="https://www.dungeon-world.com" target="_blank">
              Dungeon World
            </Link>
          </b>
          , il gioco di ruolo di{" "}
          <Link href="https://www.adam-koebel.com" target="_blank">
            Adam Koebel
          </Link>{" "}
          e{" "}
          <Link href="https://www.latorra.org/" target="_blank">
            Sage Latorra
          </Link>
          , vincitore del premio <b>Best Rules</b> agli ENnies 2013! Dungeon
          World è derivato dal Mondo dell'Apocalisse di Vincent Baker: Adam e
          Sage hanno preso il sistema di Baker e l'hanno adattato, superando
          l'originale in popolarità e successo, a un'estetica fantasy simile a
          quella proposta dai più popolari giochi di ruolo in commercio.
        </p>
        <p>
          <b>
            Ecco come lo presenta proprio Adam Koebel, coprogettista del gioco:
          </b>
        </p>
        <blockquote>
          Alle persone abituate ad altri giochi di ruolo, di solito chiedo:
          «Raccontami dell'ultima volta che hai giocato ad AD&D / Pathfinder /
          D&D 4E, e poi li ascolto mentre ricordano. Mi raccontano della loro
          <b>fantastica avventura</b>: nemici sconfitti con noncuranza, salti
          rocamboleschi su precipizi, e quell'idea geniale dell'ultimo minuto
          che ha salvato il gruppo. Quando hanno finito, gli faccio notare che
          non si sono ricordati le regole, ma ciò che è{" "}
          <b>avvenuto durante il gioco</b> ai personaggi. Si ricordano la{" "}
          <i>fiction</i>, gli eventi, la storia. Poi gli dico: «Vi va di provare
          un gioco che vi dà queste sensazioni <b>anche durante la partita</b>,
          e non solo dopo?» e da lì è una strada in discesa.
        </blockquote>
        <h4 className="text-3xl font-bold text-dw uppercase">Perché una traduzione?</h4>
        <p>
          Ho deciso di fare questa traduzione per aiutare a diffondere Dungeon
          World nel mio paese natìo, l'Italia. Il lavoro è indipendente e
          anteriore a quello effettuato da{" "}
          <Link href="https://www.narrattiva.it" target="_blank">
            Narrattiva
          </Link>{" "}
          (con cui non siamo associati) e si pone come alternativa gratuitamente
          consultabile online. Qui{" "}
          <Link href="/altro/glossario-differenze">
            Il glossario delle differenze
          </Link>{" "}
          con la loro edizione di Dungeon World.
        </p>
      </HomePageSection>
    </div>
  );
};
