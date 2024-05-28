import Link from "next/link";
import Image from "next/image";
import { HomebrewClass, StandardClass } from "src/models";
import { isEmpty, negate, trim } from "lodash";
import { FC } from "react";

export interface ClassItemProps {
  clazz: StandardClass | HomebrewClass
}

export const ClassItem: FC<ClassItemProps> = ({clazz}) => {
    const tagList: Array<string> = [];
    
    if ('compendium' in clazz && clazz.compendium) {
      tagList.push('Compendio');
    }

    if ('collection' in clazz) {
      tagList.push(clazz.authors, clazz.collection);
    }

    const tagLabel = tagList.map(trim).filter(negate(isEmpty)).join(', ');


    return <Link href={'classi/' + clazz.slug} aria-label={`Naviga alla pagina ${clazz.name}`}><div className="flex align-top flex-row space-x-4 md:space-x-8">
      <div className="flex flex-col grow space-y-2">
        <h3 className="font-bold text-xl truncate">{clazz.name}</h3>
        
        {tagLabel && <h4 className="text-slate-400 text-sm italic">{tagLabel}</h4>}
        <p className=" text-base line-clamp-2">
          {clazz.description}
        </p>
        <p className="pt-2">Vai alla scheda →</p>
      </div>
        <Image className="object-cover object-center rounded-lg" src={clazz.showcase.imageUrl} alt={clazz.showcase.heroName} width={90} height={160}/>
  </div></Link>;
}

export const ClassList = ({classes}: {classes: Array<StandardClass | HomebrewClass>}) => {
    return <div className="flex flex-col w-full space-y-8 pt-10">
        {classes.map((clazz) => <ClassItem clazz={clazz} key={clazz.slug}/>)}
    </div>;
};

export default ClassList;
