import { FC } from "react";
import {
  Cover,
  HomePageHomebrew,
  HomePageTraduction,
} from "./home-page-components";
import { HomePageAbout } from "./home-page-components/home-page-about";

export const HomePage: FC = () => {
  return (
    <div className="flex flex-col gap-y-10 md:pt-10 pb-10">
      <Cover />
      <HomePageAbout />
      <HomePageHomebrew />
      <HomePageTraduction />
    </div>
  );
};
