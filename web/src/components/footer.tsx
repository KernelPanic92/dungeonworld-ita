import { Link, ThemeSwitch, useConfig } from "nextra-theme-docs";
import { FC } from "react";

export interface FooterProps {
  menu: boolean;
}

export const Footer: FC<FooterProps> = () => {
  const config = useConfig();

  return (
    <footer className="shadow sm:flex sm:items-center sm:justify-between p-4 sm:p-6 xl:p-8 bg-neutral-900 antialiased">
      <p className="mb-4 text-sm text-center text-gray-400 sm:mb-0">
        Dungeon World Italia &copy;{" "}
        <Link className="text-dw"
          href="https://creativecommons.org/licenses/by-sa/4.0/deed.it"
          target="_blank"
        >
          CC BY-SA 4.0 2024
        </Link>
      </p>
      <div className="flex justify-center items-center space-x-1">
        <Link
          href={config.project.link}
          data-tooltip-target="tooltip-github"
          target="_blank"
          className="inline-flex justify-center p-2 rounded-lg cursor-pointer text-gray-400 nx-dark:hover:text-white hover:text-gray-900 hover:bg-gray-600"
        >
          <svg
            className="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="sr-only">Github</span>
        </Link>
        <div
          id="tooltip-github"
          role="tooltip"
          className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip bg-gray-700"
        >
          Star us on GitHub
          <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
      </div>
    </footer>
  );
};
