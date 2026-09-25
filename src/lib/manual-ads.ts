import { ADSENSE_CLIENT } from "@/lib/consent";

/**
 * In-article AdSense slots for manual pages.
 *
 * The manual body (MarkDoc) gets a `<ManualAdSlot />` marker before some
 * top-level `##` sections, rendered as an in-article ad unit through the
 * MDX component map. To respect the Google AdSense content/ads ratio:
 * - short pages (< MIN_WORDS) never get injected units;
 * - units are spaced at least MIN_WORDS_BETWEEN content words apart;
 * - a page never gets more than MAX_PER_PAGE in-article units.
 */

/** Pages shorter than this (content words) get no in-article ads. */
export const MIN_WORDS = 600;

/** Minimum content words between two injected units. */
export const MIN_WORDS_BETWEEN = 800;

/** Hard cap of in-article units per page. */
export const MAX_PER_PAGE = 3;

const AD_SLOT = "\n\n<ManualAdSlot />\n\n";

/** Content words of a source, ignoring fenced code blocks and MarkDoc tags. */
export function countWords(source: string): number {
  const text = source
    .replace(/^(```|~~~)[\s\S]*?^\1.*$/gm, "")
    .replace(/\{%(\/)?\s*\w+[^%]*%\}/g, " ");
  return text.match(/\S+/g)?.length ?? 0;
}

/**
 * Offsets of top-level `##` headings that may host an injected unit,
 * skipping fenced code blocks and MarkDoc tag blocks (callout, steps...).
 */
function findInjectionPoints(source: string): number[] {
  const points: number[] = [];
  let offset = 0;
  let fence: string | null = null;
  let tagDepth = 0;
  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (fence) {
      if (trimmed.startsWith(fence) && /^[`~\s]*$/.test(trimmed)) {
        fence = null;
      }
    } else {
      const open = trimmed.match(/^(`{3,}|~{3,})/);
      if (open) {
        fence = open[1][0].repeat(3);
      } else if (tagDepth === 0 && /^##\s/.test(trimmed)) {
        points.push(offset);
      }
    }
    for (const tag of trimmed.matchAll(/\{%\s*(\/?)\s*(\w+)/g)) {
      tagDepth = Math.max(0, tagDepth + (tag[1] ? -1 : 1));
    }
    offset += line.length + 1;
  }
  return points;
}

/**
 * Inserts `<ManualAdSlot />` markers between the sections of a manual
 * page, honouring the length guards above. A no-op when AdSense is not
 * configured or the page is too short.
 */
export function injectManualAdSlots(source: string): string {
  if (!ADSENSE_CLIENT) return source;
  if (countWords(source) < MIN_WORDS) return source;

  const points = findInjectionPoints(source);
  const parts: string[] = [];
  let lastCopied = 0;
  let injected = 0;
  let wordsSinceAd = 0;
  let prev = 0;
  for (const at of points) {
    if (injected >= MAX_PER_PAGE) break;
    wordsSinceAd += countWords(source.slice(prev, at));
    prev = at;
    if (wordsSinceAd < MIN_WORDS_BETWEEN) continue;
    parts.push(source.slice(lastCopied, at), AD_SLOT);
    lastCopied = at;
    injected += 1;
    wordsSinceAd = 0;
  }
  if (injected === 0) return source;
  parts.push(source.slice(lastCopied));
  return parts.join("");
}
