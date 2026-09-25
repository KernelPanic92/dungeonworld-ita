import { createCompiler } from "@fumadocs/mdx-remote";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Callout } from "fumadocs-ui/components/callout";
import { Steps } from "fumadocs-ui/components/steps";

/** Components available in MDX/MarkDoc content. */
export const mdxComponents = {
  ...defaultMdxComponents,
  Callout,
  Steps,
};

/**
 * Converts Keystatic MarkDoc tags ({% callout %}, {% steps %}) to their
 * Fumadocs MDX component equivalents so they can be compiled by mdx-remote.
 */
export function markdocToMdx(source: string): string {
  return source
    .replace(/\{%\s*\/\s*callout\s*%\}/g, "</Callout>")
    .replace(/\{%\s*\/\s*steps\s*%\}/g, "</Steps>")
    .replace(/\{%\s*callout([^%]*)%\}/g, (m, attrs: string) => {
      const type = attrs.match(/type=["']([^"']+)["']/)?.[1];
      const title = attrs.match(/title=["']([^"']+)["']/)?.[1];
      const parts = [];
      if (title) parts.push(`title="${title}"`);
      if (type && type !== "info") parts.push(`type="${type}"`);
      const attrsStr = parts.length > 0 ? ` ${parts.join(" ")}` : "";
      return `<Callout${attrsStr}>`;
    })
    .replace(/\{%\s*steps\s*%\}/g, "<Steps>");
}

/**
 * Compiles a MarkDoc/MDX string to a renderable MDX component.
 * Shared by the material detail page and (later) the manual reader.
 */
const compiler = createCompiler({
  preset: "fumadocs",
});

export { compiler };