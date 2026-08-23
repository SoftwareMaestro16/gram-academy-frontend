import { TonAttribution } from "./Logo";
import { useT } from "../i18n/useT";
import { format, localeShortLabels } from "../i18n/strings";
import { cn } from "../lib/cn";

/**
 * The site Footer — quiet, at the bottom of scrollable content (not fixed),
 * rendered once by `AppShell` after every screen's content instead of being
 * duplicated per-screen. Per DESIGN.md's "content is the hero" principle
 * this stays a footer, not a marketing section: just the "Built on TON"
 * attribution, the news channel link, a locale indicator, and a brand
 * credit line.
 *
 * Layout: a `justify-between` row — left column (left-aligned, stacked) has
 * the "Built on TON" attribution (sized up to read as the footer's anchor
 * element) with the `@GramAcademyNews` link directly under it; the right
 * side holds the locale indicator. The copyright credit line sits centered
 * beneath that whole row.
 *
 * `withTabBar` mirrors `Screen`'s own prop — when the bottom TabBar (visible
 * at every breakpoint) can be showing (i.e. not on lesson/quiz), the footer
 * reserves the same bottom clearance so it never sits underneath it.
 */
export function Footer({ withTabBar }: { withTabBar?: boolean }) {
  const { t, locale } = useT();
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn("content-col mt-10 px-3 pt-6 xs:px-4", withTabBar ? "pb-24" : "pb-6")}
    >
      <div className="border-t border-border pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col items-start gap-1.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-text">
              <span>{t.footer.builtOn}</span>
              <TonAttribution className="h-5" />
            </div>
            <a
              href="https://t.me/GramAcademyNews"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-accent hover:underline"
            >
              {t.footer.channel} · @GramAcademyNews
            </a>
          </div>
          <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-text-muted">
            {localeShortLabels[locale]}
          </span>
        </div>
        <p className="mt-4 text-center text-xs text-text-faint">
          {format(t.footer.credit, { year })}
        </p>
      </div>
    </footer>
  );
}
