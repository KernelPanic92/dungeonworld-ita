import React from "react";
import Markdoc, { type Node as MarkdocNode } from "@markdoc/markdoc";
import type { TOCItemType } from "fumadocs-core/toc";
import { createMarkdocRenderConfig, indexNotes } from "./config";
import { collectHeadings } from "./toc";
import { rendererComponents } from "./renderers";

export interface RenderedDocument {
  /** Ready-to-render React tree (server components included). */
  content: React.ReactNode;
  toc: TOCItemType[];
}

/**
 * Renders a Keystatic markdoc body: transform the AST with the site config
 * (content components + heading anchors + endnotes), collect the TOC and turn
 * the renderable tree into React through Markdoc's official renderer.
 */
export function renderMarkdoc(node: MarkdocNode): RenderedDocument {
  const config = createMarkdocRenderConfig(indexNotes(node));
  const renderable = Markdoc.transform(node, config);
  return {
    content: Markdoc.renderers.react(renderable, React, {
      components: rendererComponents,
    }),
    toc: collectHeadings(renderable),
  };
}

/**
 * The Markdoc source of an AST (for llms.txt bodies and search structured
 * data), with the custom tag markers stripped: the inner content stays.
 */
export function markdocSource(node: MarkdocNode): string {
  return Markdoc.format(node)
    .replace(/\{%\s*(\/)?(callout|steps|media-block|note)[^%]*%\}/g, "")
    .trim();
}
