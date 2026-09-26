import { redirect } from "next/navigation";
import { cookies, draftMode } from "next/headers";
import ruleSetRepository from "@/lib/content";

/**
 * Enables Next.js draft mode for a Keystatic preview: remembers the GitHub
 * branch in a cookie and redirects to the requested page, which will then be
 * rendered from the branch content (see the draft-aware ReaderFactory).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const branch = url.searchParams.get("branch");
  const to = url.searchParams.get("to");
  if (!branch || !to) {
    return new Response("Missing branch or to params", { status: 400 });
  }
  (await draftMode()).enable();
  const c = await cookies();
  c.set("ks-branch", branch);

  // Material entries use versioned slugs (1.0/barbaro); turn the preview URL
  // /materiali/{version}/{rest} into the versioned material route
  // /{version}/materiali/{rest} so the detail page can resolve it.
  let target = to;
  try {
    const versions = (await ruleSetRepository.getVersions()).map((v) => v.slug);
    const segs = to.split("/").filter(Boolean);
    if (segs[0] === "materiali" && segs.length > 1 && versions.includes(segs[1])) {
      target = `/${segs[1]}/materiali/${segs.slice(2).join("/")}`;
    }
  } catch {
    // leave `to` untouched if the branch cannot be read
  }

  const toUrl = new URL(target, url.origin);
  toUrl.protocol = url.protocol;
  toUrl.host = url.host;
  redirect(toUrl.toString());
}