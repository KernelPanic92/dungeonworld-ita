import { getSiteLlms } from "@/lib/llms";

// cached forever: content is static per deployment
export const revalidate = false;

export async function GET() {
  const generator = await getSiteLlms();
  return new Response(await generator.full(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}