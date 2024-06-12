import { FC } from "react";
import Image from "next/image";
import Link from "next/link";

export interface ClassCardProps {
  name: string;
  collection: string;
  image: string;
  link: string;
}

export const ClassCard: FC<ClassCardProps> = ({ image, collection, name, link }) => {
  return (
    <Link href={link}>
    <div className="w-44 h-64 relative overflow-hidden inline-block">
      <Image
        src={image}
        className="object-center object-cover"
        alt={`${name} ${collection}`}
        quality={50}
        loading="lazy"
        fill
      ></Image>
       <div className="absolute flex flex-col justify-end items-start inset-0 bg-gradient-to-t from-[#000000] from-5% to-60% px-1 py-4 gap-y-1">
        <h5 className="font-bold text-sm text-white">{name}</h5>
        <p className="text-xs  text-white">{collection}</p>
       </div>
    </div>
    </Link>
  );
};
