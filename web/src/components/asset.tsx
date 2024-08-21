import { Link } from "nextra-theme-docs";
import Image from "next/image";
import { Asset as AssetModel } from "src/models";

export const Asset = ({ asset }: { asset: AssetModel }) => {
  return (
    <Link
      key={asset.name}
      href={asset.url}
      target="_blank"
      className="inline-block px-3 flex-col no-underline w-[200px] h-[283px] overflow-hidden"
    >
        <Image
          src={asset.thumbnail}
          alt=""
          quality={100}
          loading="lazy"
          aria-labelledby={asset.name}
          height={283}
          width={200}
        />
   
      <div
        id={asset.name}
        className="flex flex-col justify-end items-start px-1 py-4 gap-y-1 font-bold text-sm text-white"
      >
        <span>{asset.name}</span>
      </div>
    </Link>
  );
};
