import { TonAttribution } from "./Logo";
import { useT } from "../i18n/useT";
import { format, localeShortLabels } from "../i18n/strings";
import { cn } from "../lib/cn";

/**
 * The site Footer — quiet, at the bottom of scrollable content (not fixed),
 * rendered once by `AppShell` after every screen's content instead of being
 * duplicated per-screen. Per DESIGN.md's "content is the hero" principle
 * this stays a footer, not a marketing section: just the "Built on TON"
 * attribution, a small brand credit line, and a locale indicator.
 *
 * `withTabBar` mirrors `Screen`'s own prop — when the mobile bottom TabBar
 * can be showing (i.e. not on lesson/quiz), the footer reserves the same
 * bottom clearance so it never sits underneath it.
 */
export function Footer({ withTabBar }: { withTabBar?: boolean }) {
  const { t, locale } = useT();
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "content-col mt-10 px-3 pt-6 text-center xs:px-4",
        withTabBar ? "pb-24 sm:pb-8" : "pb-6",
      )}
    >
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-center gap-1.5 text-xs text-text-faint">
          <span>{t.footer.builtOn}</span>
          <TonAttribution />
        </div>
        <p className="mt-2 text-xs text-text-faint">
          {format(t.footer.credit, { year })}
          <span aria-hidden> · </span>
          {localeShortLabels[locale]}
        </p>
        <a
          href="https://t.me/GramAcademyNews"
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs text-accent hover:underline"
        >
          {t.footer.channel} · @GramAcademyNews
        </a>
      </div>
    </footer>
  );
}
