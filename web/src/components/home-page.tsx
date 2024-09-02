import { FC } from "react";
import {
  Cover,
  HomePageDownloads,
  HomePageFAQ,
  HomePageHomebrew,
  HomePageManual,
  HomePageProject,
} from "./home-page-components";
import { HomePageAbout } from "./home-page-components/home-page-about";

export const HomePage: FC = () => {
  return (
    <div className="flex flex-col gap-y-24 pt-10 pb-10 text-xl">
      <Cover />
      <HomePageAbout />
      <HomePageManual />
      <HomePageHomebrew />
      <HomePageDownloads />
      <HomePageProject />
      <HomePageFAQ />
    </div>
  );
};
