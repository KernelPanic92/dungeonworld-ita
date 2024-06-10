import { FC } from "react";
import Image from "next/image";

export interface ClassCardProps {
  name: string;
  collection: string;
  image: string;
}

export const ClassCard: FC<ClassCardProps> = ({ image }) => {
  return (
    <div className="w-44 h-64 relative overflow-hidden inline-block">
      <Image
        priority
        src={image}
        className="object-center object-cover"
        alt="Immagine di sfondo"
        fill
      ></Image>
    </div>
  );
};
