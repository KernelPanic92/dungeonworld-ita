import { notFound } from "next/navigation";
import { createFromSource } from "fumadocs-core/search/server";
import { isValidManualVersion } from "@/lib/keystatic";
import { getManualSource } from "@/lib/source";

// cached forever: content is static per deployment
export const revalidate = false;

interface Params {
  params: Promise<{ "manual-version": string }>;
}

export async function GET(request: Request, { params }: Params) {
  const { "manual-version": version } = await params;
  if (!(await isValidManualVersion(version))) notFound();

  const source = await getManualSource(version);
  const loader = await source.get();
  const { GET: searchGet } = createFromSource(loader);
  return searchGet(request);
}