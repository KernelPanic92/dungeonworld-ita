import { readFileSync } from "node:fs";
import path from "node:path";
import type { ComponentProps, ReactNode } from "react";
import { imageSize } from "image-size";
import { highlight } from "fumadocs-core/highlight";
import { Callout } from "fumadocs-ui/components/callout";
import { Steps } from "fumadocs-ui/components/steps";
import { CodeBlock } from "fumadocs-ui/components/codeblock";
import { Heading as AnchorHeading } from "fumadocs-ui/components/heading";
import defaultMdxComponents from "fumadocs-ui/mdx";

type HighlightOptions = Parameters<typeof highlight>[1];

/**
 * Heading with anchor: the `Heading` tag is produced by the markdoc heading
 * transform (slugified id injected per document).
 */
function RendererHeading({
  level,
  id,
  children,
}: {
  level: number;
  id?: string;
  children: ReactNode;
}) {
  const Tag = `h${Math.min(6, Math.max(1, level))}` as
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6";
  return (
    <AnchorHeading as={Tag} id={id}>
      {children}
    </AnchorHeading>
  );
}

/**
 * Fenced code block, highlighted with fumadocs' shiki integration (same
 * dual github themes as the previous MDX pipeline).
 */
async function RendererCodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  const content = await highlight(code, {
    lang: language ?? "text",
    fallbackLanguage: "text",
  } as HighlightOptions);
  return <CodeBlock>{content}</CodeBlock>;
}

/** {% callout type="..." title="..." %} → fumadocs Callout. */
function RendererCallout({
  children,
  title,
  type,
}: {
  children?: ReactNode;
  title?: string;
  type?: string;
}) {
  return (
    <Callout title={title} type={type as ComponentProps<typeof Callout>["type"]}>
      {children}
    </Callout>
  );
}

/**
 * Inline images: content uses public absolute paths (/images/...), so the
 * intrinsic size is read from the public directory and passed to the
 * fumadocs Image component (next/image requires it), mirroring what the
 * previous remarkImage plugin did at compile time.
 */
function RendererImg({
  src,
  alt,
  title,
}: {
  src: string;
  alt?: string;
  title?: string;
}) {
  const Image = defaultMdxComponents.img;
  let size: { width: number; height: number } | undefined;
  if (src.startsWith("/")) {
    try {
      const file = readFileSync(path.join(process.cwd(), "public", src));
      size = imageSize(file);
    } catch {
      // missing file: let next/image report the prop error as before
    }
  }
  return <Image src={src} alt={alt ?? ""} title={title} {...size} />;
}

/**
 * Endnote ({% note %}), pattern raccomandato da Markdoc:
 * - self-closing {% note #id /%} → riferimento numerato nel testo (superscript)
 * - {% note #id %}…{% /note %} → la nota, in fondo al documento
 * id/number/isRef arrivano dal transform in config.ts.
 */
function RendererNote({
  id,
  number,
  isRef,
  children,
}: {
  id?: string;
  number?: number;
  isRef?: boolean;
  children?: ReactNode;
}) {
  if (isRef) {
    return (
      <sup id={`fnref-${id}`} className="ml-0.5 align-super">
        <a
          href={`#fn-${id}`}
          className="text-foreground/60 no-underline transition-colors hover:text-primary"
        >
          [{number}]
        </a>
      </sup>
    );
  }
  return (
    <p
      id={`fn-${id}`}
      className="text-sm leading-relaxed text-foreground/75"
    >
      <sup className="mr-1 text-[0.75em]">[{number}]</sup>
      <span className="[&>*:last-child]:inline">{children}</span>{" "}
      <a
        href={`#fnref-${id}`}
        aria-label="Torna al riferimento"
        className="no-underline hover:text-primary"
      >
        ↩
      </a>
    </p>
  );
}

const ITEM_CLASSES: Record<string, string> = {
  top: "items-start",
  center: "items-center",
  bottom: "items-end",
  stretch: "items-stretch",
};

const JUSTIFY_CLASSES: Record<string, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  "space-between": "justify-between",
  "space-around": "justify-around",
  "space-evenly": "justify-evenly",
};

/**
 * Media block: un'immagine affiancata al testo (Word/Google Docs style).
 * Props:
 *   - image: path to image (absolute like "/images/..." or relative like "foo.png" from public/images)
 *   - position: "left" | "right" — on desktop, which side the image occupies
 *   - align: "top" | "center" | "bottom" | "stretch" — cross-axis alignment (items-*)
 *   - justify: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly" — main-axis justification (justify-*)
 *   - mobileOrder: "follow" | "image-first" — controls stacking order on mobile
 *
 * Desktop (md+): flex row, image width capped at ~40%, text fills rest.
 * Mobile: flex column, each item full width, natural height.
 *
 * The image is rendered via next/image with intrinsic size when possible.
 */
function RendererMediaBlock({
  image,
  position = "right",
  align = "top",
  justify = "start",
  mobileOrder = "follow",
  children,
}: {
  image?: string;
  position?: string;
  align?: string;
  justify?: string;
  mobileOrder?: string;
  children?: ReactNode;
}) {
  // Resolve image src: allow absolute paths or bare filenames from public/images
  const src =
    image &&
    !/^(?:https?:)?\//.test(image) &&
    !image.startsWith("images/")
      ? `/images/${image.replace(/^\/+/, "")}`
      : image;

  const Image = defaultMdxComponents.img;
  let size: { width: number; height: number } | undefined;
  if (src?.startsWith("/")) {
    try {
      const file = readFileSync(path.join(process.cwd(), "public", src));
      size = imageSize(file);
    } catch {
      // missing file: next/image will report the missing src as before
    }
  }

  // Determine if image should come first in the DOM
  const imageFirst =
    mobileOrder === "image-first"
      ? true
      : position === "left";

  const imageEl = (
    <div className="flex-shrink-0 w-full md:w-[40%] md:max-w-[40%]">
      {src ? (
        <Image
          src={src}
          alt=""
          className="h-auto"
          sizes="(min-width: 640px) 40vw, 100vw"
          {...size}
        />
      ) : null}
    </div>
  );

  const textEl = <div className="flex-shrink-0 w-full md:flex-1">{children}</div>;

  return (
    <div
      className={`flex flex-col gap-4 md:flex-row ${ITEM_CLASSES[align] ?? ""} ${JUSTIFY_CLASSES[justify] ?? ""}`}
    >
      {imageFirst ? (
        <>
          {imageEl}
          {textEl}
        </>
      ) : (
        <>
          {textEl}
          {imageEl}
        </>
      )}
    </div>
  );
}

/**
 * Component map for Markdoc.renderers.react: capitalized render names from
 * the markdoc config resolve against this map, lowercase names fall through
 * to intrinsic elements (paragraphs, lists, inline code, ...).
 */
export const rendererComponents = {
  Heading: RendererHeading,
  CodeBlock: RendererCodeBlock,
  Callout: RendererCallout,
  Steps,
  MediaBlock: RendererMediaBlock,
  Note: RendererNote,
  Table: defaultMdxComponents.table,
  A: defaultMdxComponents.a,
  Img: RendererImg,
};
