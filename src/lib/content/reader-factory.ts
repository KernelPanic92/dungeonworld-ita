import { createReader } from "@keystatic/core/reader";
import { createGitHubReader } from "@keystatic/core/reader/github";
import config from "../../../keystatic.config";

const REPO = "KernelPanic92/dungeonworld-ita";

export type Reader = ReturnType<
  typeof createReader<typeof config["collections"], typeof config["singletons"]>
>;

/**
 * Encapsulates Keystatic GitHub reader creation (one per preview branch) as
 * a flyweight.
 */
export class ReaderFactory {
  private readonly drafts = new Map<string, Reader>();

  /** A GitHub reader bound to a branch (flyweight), for previews. */
  public async forBranch(branch: string): Promise<Reader> {
    let reader = this.drafts.get(branch);
    if (!reader) {
      let token: string | undefined;
      try {
        const { cookies } = await import("next/headers");
        token = (await cookies()).get("keystatic-gh-access-token")?.value;
      } catch {
        // cookies() throws outside a request: preview without token
      }
      reader = createGitHubReader(config, {
        repo: REPO,
        ref: branch,
        token,
      }) as Reader;
      this.drafts.set(branch, reader);
    }
    return reader;
  }
}

/**
 * Branch of the active Keystatic preview, when draft mode is on; null when
 * draft mode is off or the code runs outside a request (static generation,
 * scripts), in which case content is read locally.
 */
export async function currentDraftBranch(): Promise<string | null> {
  try {
    const { draftMode, cookies } = await import("next/headers");
    if (!(await draftMode()).isEnabled) return null;
    return (await cookies()).get("ks-branch")?.value ?? null;
  } catch {
    return null;
  }
}

const readers = new ReaderFactory();
export default readers;
