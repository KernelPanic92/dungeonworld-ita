import { readFile } from "node:fs/promises";
import path from "node:path";
import Markdoc from "@markdoc/markdoc";

const PROGETTO_PATH = "docs/progetto.mdoc";

/**
 * The progetto page is plain content outside any Keystatic collection: read
 * its file and parse it with Markdoc directly (no frontmatter to strip).
 */
export async function getProgettoNode() {
  const raw = await readFile(path.join(process.cwd(), PROGETTO_PATH), "utf8");
  return Markdoc.parse(raw);
}
