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

/** Maps a URL root segment to its directory in the repo. */
const ROOT_MAP: Record<string, string> = {
  materiali: path.join("docs", "materiali"),
  manuale: path.join("docs", "manuale"),
  // Material downloads reference design/ sources directly (see the
  // `file` asset field in keystatic.config): only the PDFs are bundled
  // for the route (see outputFileTracing in next.config).
  design: "design",
};

// cached forever: content is static per deployment
export const revalidate = false;

interface Params {
  params: Promise<{ path: string[] }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { path: segments } = await params;
  const [root, ...rest] = segments;
  const dir = ROOT_MAP[root];
  if (!dir) notFound();

  // no traversal: the resolved path must stay inside the mapped directory
  const absRoot = path.resolve(process.cwd(), dir);
  const resolved = path.resolve(absRoot, ...rest);
  if (!(resolved === absRoot || resolved.startsWith(absRoot + path.sep))) notFound();

  let stats;
  try {
    stats = await stat(resolved);
  } catch {
    notFound();
  }
  if (!stats.isFile()) notFound();

  const ext = path.extname(resolved).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  // serve as a download: the browser saves the file instead of navigating
  const filename = path.basename(resolved);
  const asciiFilename = filename.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
  const disposition = `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`;

  const stream = createReadStream(resolved);
  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stats.size),
      "Content-Disposition": disposition,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
