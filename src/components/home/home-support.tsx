import { KOFI_PAGE_URL } from "@/lib/kofi";
import { ButtonLink } from "./button-link";
import { HomePageSection } from "./home-page-section";

function KoFiIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
    >
      <path d="M3 7h13v8.5A4.5 4.5 0 0 1 11.5 20h-4A4.5 4.5 0 0 1 3 15.5V7z" />
      <path d="M16 9.5h1.75a2.75 2.75 0 0 1 0 5.5H16" />
      <path
        d="M9.5 15.5c-1.2-.9-2.6-2-2.6-3.3 0-.9.7-1.7 1.6-1.7.5 0 .8.2 1 .5.2-.3.5-.5 1-.5.9 0 1.6.8 1.6 1.7 0 1.3-1.4 2.4-2.6 3.3z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function HomeSupport() {
  return (
    <HomePageSection>
      <div className="flex flex-col">
        <h3 className="text-2xl font-bold text-dw uppercase mb-5">
          Supportaci
        </h3>
        <p className="pb-10">
          Dungeon World Italia è e resta un progetto gratuito: manteniamo il
          sito, traduciamo nuovi contenuti e pubblichiamo materiali nel tempo
          libero. Se il progetto ti è utile, offrici un caffè su Ko-fi: ogni
          contributo, anche piccolo, ci aiuta a coprire i costi e a continuare
          a far crescere la traduzione.
        </p>
        <ButtonLink
          href={KOFI_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Sostieni il progetto su Ko-fi"
        >
          <KoFiIcon />
          Sostienici su Ko-fi
        </ButtonLink>
      </div>
    </HomePageSection>
  );
}
