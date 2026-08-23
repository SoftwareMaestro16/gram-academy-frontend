import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { cn } from "../lib/cn";
import { API_BASE } from "../api/http";

/**
 * Best-effort section cover image. `Section` (schemas.ts) has no image field —
 * the backend doesn't have a per-section cover-image system yet. It does
 * already serve NFT collection art as plain static files for two known slugs
 * (`ton-basics`, `ton-assets`) at `/v1/metadata/images/nfts/<slug>/<slug>.png`
 * (server/api/src/server.ts). We try that path and fall back to a plain
 * accent-soft placeholder on error, so a section whose slug doesn't match one
 * of those folders still looks intentional instead of broken.
 */
export function SectionImage({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "flex h-28 w-full items-center justify-center rounded-xl bg-accent-soft",
          className,
        )}
      >
        <GraduationCap className="h-7 w-7 text-accent" />
      </div>
    );
  }

  return (
    <img
      src={`${API_BASE}/v1/metadata/images/nfts/${slug}/${slug}.png`}
      alt=""
      aria-hidden
      className={cn("h-28 w-full rounded-xl object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
