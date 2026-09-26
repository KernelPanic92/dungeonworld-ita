import { fields } from "@keystatic/core";
import {
  Tag,
  type Config,
  type Node as MarkdocNode,
} from "@markdoc/markdoc";
import GithubSlugger from "github-slugger";
import { contentComponents } from "../../../../keystatic.config";

/** Plain text of a Markdoc AST node (used for heading slugs). */
export function astText(node: MarkdocNode): string {
  if (node.type === "text") {
    return typeof node.attributes.content === "string"
      ? node.attributes.content
      : "";
  }
  return (node.children ?? []).map(astText).join("");
}

/** True when a {% note %} tag carries actual content (definition, not ref). */
function noteHasContent(node: MarkdocNode): boolean {
  return (node.children ?? []).some(
    (c) =>
      c.type !== "text" ||
      (typeof c.attributes.content === "string" &&
        c.attributes.content.trim() !== ""),
  );
}

/**
 * Pre-pass sulle note: assegna un numero progressivo a ciascun riferimento
 * {% note #id /%} in ordine di prima apparizione nel documento.
 */
export function indexNotes(node: MarkdocNode): Map<string, number> {
  const numbers = new Map<string, number>();
  let next = 1;
  const visit = (n: MarkdocNode) => {
    if (n.tag === "note" && !noteHasContent(n)) {
      const id = n.attributes.id;
      if (typeof id === "string" && id && !numbers.has(id)) {
        numbers.set(id, next++);
      }
    }
    (n.children ?? []).forEach(visit);
  };
  visit(node);

  return numbers;
}

/**
 * The Markdoc render config: keystatic's stored content (its content
 * components: {% callout %}, {% steps %}, {% note %}) mapped to capitalized
 * render names resolved by the React renderer's component map, plus custom
 * transforms for heading anchors (slugified, deduped per document), fenced
 * code blocks (code/language exposed as props to the async highlighter
 * component) and endnotes ({% note %} → numbered ref/definition).
 */
export function createMarkdocRenderConfig(
  noteNumbers: Map<string, number> = new Map(),
): Config {
  const config = fields.markdoc.createMarkdocConfig({
    components: contentComponents,
    render: {
      tags: {
        callout: "Callout",
        steps: "Steps",
        "media-block": "MediaBlock",
        note: "Note",
      },
      nodes: { fence: "CodeBlock", table: "Table", link: "A", image: "Img" },
    },
  });

  const slugger = new GithubSlugger();
  const nodes = config.nodes ?? {};

  // {% note %} → "Note": self-closing = riferimento numerato nel testo,
  // con contenuto = definizione (endnote) in fondo al documento.
  const tags = {
    ...config.tags,
    note: {
      ...(config.tags?.note ?? {}),
      attributes: { id: { type: String } },
      transform(node: MarkdocNode, cfg: Config) {
        const id = node.attributes.id;
        const isRef = !noteHasContent(node);
        const number = noteNumbers.get(id) ?? 0;
        return new Tag(
          "Note",
          { id, number, isRef },
          isRef ? [] : node.transformChildren(cfg),
        );
      },
    },
  };
  if (nodes.heading) {
    nodes.heading = {
      ...nodes.heading,
      transform(node: MarkdocNode, cfg: Config) {
        const id = slugger.slug(astText(node));
        const level = node.attributes.level;
        return new Tag("Heading", { id, level }, node.transformChildren(cfg));
      },
    };
  }

  if (nodes.fence) {
    nodes.fence = {
      ...nodes.fence,
      transform(node: MarkdocNode) {
        const code =
          typeof node.attributes.content === "string"
            ? node.attributes.content
            : "";
        const language =
          typeof node.attributes.language === "string"
            ? node.attributes.language
            : undefined;
        return new Tag("CodeBlock", { code, language }, []);
      },
    };
  }
  return { ...config, tags, nodes };
}
