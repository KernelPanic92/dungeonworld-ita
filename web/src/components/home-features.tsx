import { FC } from "react";

export const HomeFeatures: FC = () => {
  return (
    <div className="grid md:grid-cols-2 2xl:grid-cols-3 gap-8">
      <Feature
        title="Avventura fantasy classica"
        description="Esplora una terra di magia e pericolo nei panni di avventurieri in cerca di fama, oro e gloria."
      />
      <Feature
        title="Parla di ciò che conta"
        description="Le semplici regole di Dungeon World si basano su ciò che accade nel gioco, quindi passi più tempo a parlare dell'azione e meno tempo a parlare delle regole."
      />
      <Feature
        title="GM Toolkit"
        description="Gestire un gioco non dovrebbe essere una seccatura. Dungeon World fornisce al Game Master tutti gli strumenti per condurre il gioco in modo rapido e semplice. I fronti ti aiutano a mantenere in vita e in evoluzione il mondo intorno ai giocatori. Le mosse sono modi per far avanzare il tuo gioco. E la tua agenda ti mantiene sulla buona strada."
      />
      <Feature
        title="Nessun vicolo cieco"
        description="Le regole portano sempre avanti l’azione in modi inaspettati. Lanciare i dadi porta sempre a un risultato interessante."
      />
      <Feature
        title="Design pluripremiato"
        description="Dungeon World has won an Ennie for Best Rules, a Golden Geek for Best RPG, and an Indie RPG Award."
      />
      <Feature
        title="Licenza aperta"
        description="Il testo di Dungeon World è rilasciato sotto licenza Creative Commons Attribution. Puoi creare, distribuire e persino vendere tutto ciò che ti piace basato su Dungeon World."
      />
    </div>
  );
};

const Feature: FC<{ title: string, description: string }> = ({title, description}) => {
  return (
    <div className="max-w-sm max-h-sm aspect-square p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 flex flex-col justify-center items-center text-center">
      <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
        {title}
      </h5>
      <p className="mb-3 font-normal text-gray-500 dark:text-gray-400 line-clamp-6">
        {description}
      </p>
    </div>
  );
};
