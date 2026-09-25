import { notFound } from "next/navigation";
import { isValidManualVersion } from "@/lib/keystatic";
import { getLlms, getManualSource } from "@/lib/source";

// cached forever: content is static per deployment
export const revalidate = false;

interface Params {
  params: Promise<{
    "manual-version": string;
    slug?: string[];
  }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { "manual-version": version, slug } = await params;

  if (!(await isValidManualVersion(version))) notFound();

  const source = await getManualSource(version);
  const loader = await source.get();
  const page = loader.getPage(slug ?? []);
  if (!page) notFound();

  const generator = await getLlms(version);
  return new Response(await generator.page(page), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
