import { Tag, type RenderableTreeNode } from "@markdoc/markdoc";
import type { TOCItemType } from "fumadocs-core/toc";

export type { TOCItemType };

/** Plain text of a renderable tree fragment (used for TOC titles). */
export function renderableText(node: RenderableTreeNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (node instanceof Tag) return node.children.map(renderableText).join("");
  return "";
}

/**
 * Extracts the table of contents from a transformed Markdoc tree, mirroring
 * fumadocs' remark-heading behavior (every heading depth, title as plain
 * text, url pointing at the slugified anchor injected by the heading
 * transform).
 */
export function collectHeadings(
  node: RenderableTreeNode | RenderableTreeNode[],
  sections: TOCItemType[] = [],
): TOCItemType[] {
  if (Array.isArray(node)) {
    for (const child of node) collectHeadings(child, sections);
    return sections;
  }
  if (node instanceof Tag) {
    if (node.name === "Heading" && typeof node.attributes.id === "string") {
      const depth = Number(node.attributes.level);
      if (Number.isFinite(depth)) {
        sections.push({
          title: renderableText(node),
          url: `#${node.attributes.id}`,
          depth,
        });
      }
    }
    for (const child of node.children) collectHeadings(child, sections);
  }
  return sections;
}
