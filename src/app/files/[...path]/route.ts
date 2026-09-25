import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";

const MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".md": "text/markdown; charset=utf-8",
  ".yaml": "text/yaml; charset=utf-8",
};

/** Directories allowed to be served (relative to repo root). */
const ALLOWED_ROOTS = [path.join("docs", "materiali"), path.join("docs", "manuale")];

// cached forever: content is static per deployment
export const revalidate = false;

interface Params {
  params: Promise<{ path: string[] }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { path: segments } = await params;
  const rel = segments.join("/");

  // no traversal: the resolved path must stay inside an allowed root
  const resolved = path.resolve(process.cwd(), "docs", rel);
  const allowed = ALLOWED_ROOTS.some((root) => {
    const absRoot = path.resolve(process.cwd(), root);
    return resolved === absRoot || resolved.startsWith(absRoot + path.sep);
  });
  if (!allowed) notFound();

  let stats;
  try {
    stats = await stat(resolved);
  } catch {
    notFound();
  }
  if (!stats.isFile()) notFound();

  const ext = path.extname(resolved).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  const stream = createReadStream(resolved);
  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stats.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
