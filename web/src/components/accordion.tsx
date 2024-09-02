import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, PropsWithChildren, useState } from "react";
import cb from "clsx";

export const AccordionItem: FC<PropsWithChildren<{ title: string }>> = ({
  title,
  children,
}) => {
  const [open, setValue] = useState(false);

  const itemId = `accordion-trigger-${title}`;
  return (
    <div>
      <dt
        role="heading"
        id={itemId}
        className={cb("border-[#e5e7eb81]", { "border-b-[1px]": !open })}
      >
        <button
          className="w-full h-min-20 px-4 py-6 flex flex-row items-center"
          onClick={() => setValue((value) => !value)}
        >
          <div className="font-bold text-left text-wrap mr-2">{title}</div>
          <div className="flex flex-row flex-auto justify-end">
            <FontAwesomeIcon icon={open ? faMinus : faPlus} height={"1rem"} />
          </div>
        </button>
      </dt>
      <dl
        aria-labelledby={itemId}
        className={cb("p-4 pb-6 border-b-[1px] border-[#e5e7eb81]", {
          hidden: !open,
        })}
      >
        {children}
      </dl>
    </div>
  );
};

export const Accordion: FC<PropsWithChildren> = ({ children }) => (
  <dl className="border-t-[1px] border-[#e5e7eb81] w-full">{children}</dl>
);
