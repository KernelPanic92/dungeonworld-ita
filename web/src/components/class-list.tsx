import Link from "next/link";
import Image from "next/image";
import { HomebrewClass, StandardClass } from "src/models";

export const ClassItem = ({clazz}: {clazz: StandardClass | HomebrewClass}) => {
    return <div className="flex w-full align-top flex-row space-x-4 md:space-x-8">
      <div className="flex flex-col space-y-2 md:space-y-2">
        <h3 className="font-bold text-xl truncate">{clazz.name}{'compendium' in clazz && clazz.compendium && ' [Compendio]'}</h3>
        {'collection' in clazz && <h4 className="text-slate-400 text-sm">{clazz.authors}, {clazz.collection}</h4>}
        <p className=" text-base line-clamp-2">
          {clazz.description}
        </p>
        <Link href={'classi/' + clazz.slug}>Vai alla scheda →</Link>
      </div>
      <div className="w-20 h-36 md:w-28 md:h-48 relative overflow-hidden">
        <Image className="object-cover object-center rounded-lg" src={clazz.showcase.imageUrl} alt={clazz.showcase.heroName} fill={true} />
      </div>
  </div>;
}

export const ClassList = ({classes}: {classes: Array<StandardClass | HomebrewClass>}) => {
    return <div className="flex flex-col w-full space-y-8 pt-10">
        {classes.map((clazz) => <ClassItem clazz={clazz} key={clazz.slug}/>)}
    </div>;
};

export default ClassList;
