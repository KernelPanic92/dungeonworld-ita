import { Cover } from "./cover";
import { HomeAbout } from "./home-about";
import { HomeDownloads } from "./home-downloads";
import { HomeFaq } from "./home-faq";
import { HomeHomebrew } from "./home-homebrew";
import { HomeManual } from "./home-manual";
import { HomePbta } from "./home-pbta";
import { HomeProject } from "./home-project";
import { HomeSupport } from "./home-support";

export function HomePage() {
  return (
    <div className="flex flex-col gap-y-24 pt-10 pb-10 text-xl">
      <Cover />
      <HomeAbout />
      <HomeManual />
      <HomeHomebrew />
      <HomeDownloads />
      <HomePbta />
      <HomeProject />
      <HomeSupport />
      <HomeFaq />
    </div>
  );
}
