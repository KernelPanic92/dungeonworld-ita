import { getDefaultManualVersion } from "@/lib/keystatic";
import { getLlms } from "@/lib/source";

// cached forever: content is static per deployment
export const revalidate = false;

export async function GET() {
  const version = await getDefaultManualVersion();
  const generator = await getLlms(version);
  return new Response(await generator.index(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
