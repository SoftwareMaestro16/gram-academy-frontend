import { cn } from "../lib/cn";
import { format } from "../i18n/strings";

/** Telegram Stars currency icon — a custom gold-gradient star (not a scraped
 *  third-party logo asset: no reliably-licensed official Stars mark was
 *  found, see public/telegram-stars.svg), used everywhere a Stars price is
 *  shown instead of the plain "⭐" emoji. Same fixed brand-color-not-themed
 *  treatment as `TonAttribution`/`GramMark`. */
export function StarsIcon({ className }: { className?: string }) {
  return (
    <img
      src="/telegram-stars.svg"
      alt=""
      aria-hidden
      className={cn("inline h-[1em] w-[1em] shrink-0 align-[-0.15em]", className)}
    />
  );
}

/** Renders an i18n template containing a literal `{star}` token (alongside
 *  `format()`-substituted vars like `{n}`) as text with a real `StarsIcon`
 *  in place of the token — `format()` only touches keys present in `vars`,
 *  so `{star}` survives that pass and gets split out here. The token's
 *  position in the template already reflects each locale's own word order
 *  (e.g. "{n} {star}" in en/ru, "{n} {star} 购买" in zh), so this works
 *  regardless of where the icon falls in the sentence. */
export function StarsLabel({
  template,
  vars,
}: {
  template: string;
  vars: Record<string, string | number>;
}) {
  const resolved = format(template, vars);
  const [before, after] = resolved.split("{star}");
  return (
    <>
      {before}
      <StarsIcon />
      {after}
    </>
  );
}
