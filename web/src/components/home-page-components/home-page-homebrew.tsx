import { dungeonWorldData } from "@/data/dungeon-world";
import { HomePageSection } from "./home-page-section";
import { ClassCard } from "../class-card";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

export const HomePageHomebrew = () => {
  const firstClasses = dungeonWorldData.homebrew.classes.slice(7, 16);

  return (
    <HomePageSection>
      <h3 className="text-xl sm:2xl md:text-3xl font-bold text-dw uppercase">
        Homebrew
      </h3>
      <p>
        Dungeon World Italia è arricchita con materiale homebrew della
        community. Accedi a traduzioni italiane di libretti famosi di Dungeon
        World, espandendo le tue opzioni di gioco con nuove classi e abilità.
        Visita le nostre sezioni dedicate per scoprire tutto il materiale
        disponibile e inizia la tua avventura con Dungeon World!
      </p>
      
      <p className="font-bold">Ecco alcune delle classi che potrai trovare:</p>
      <div className="flex overflow-x-scroll pt-2 hide-scroll-bar w-full">
        <div className="flex flex-nowrap">
          {firstClasses.map((clazz) => (
            <div className="inline-block px-3">
              <ClassCard
                collection={clazz.collection}
                image={clazz.showcase.imageUrl}
                key={clazz.name + clazz.collection}
                name={clazz.name}
                link={`/homebrew/classi/${clazz.slug}`}
              />
            </div>
          ))}
          <div className="inline-block px-3">
            <Link href="/homebrew/classi">
              <div className="w-44 h-64 flex flex-col items-center justify-center gap-y-1">
                <FontAwesomeIcon icon={faArrowRight} className="w-12 h-12" />
                <p>Lista completa</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <Link href={"/homebrew"}>
        <button className="bg-dw drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] hover:bg-dw-700 text-white font-bold py-2 px-4 mt-5 rounded-full text-sm uppercase">
          Scopri la sezione homebrew
        </button>
      </Link>
    </HomePageSection>
  );
};