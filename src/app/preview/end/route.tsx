import { cookies, draftMode } from "next/headers";

/** Disables draft mode and clears the preview branch cookie. */
export async function POST(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) {
    return new Response("Invalid origin", { status: 400 });
  }
  const referrer = req.headers.get("Referer");
  if (!referrer) {
    return new Response("Missing Referer", { status: 400 });
  }
  (await draftMode()).disable();
  const c = await cookies();
  c.delete("ks-branch");
  return Response.redirect(referrer, 303);
}