import type { ReactNode } from "react";
import { ArrowRight, Award, BookOpen, MessageCircle } from "lucide-react";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { useT } from "../../i18n/useT";
import { useAppStore } from "../../state/useAppStore";
import { useInView } from "../../lib/useInView";
import { cn } from "../../lib/cn";

/** One full advantage section: icon badge, title, body, and an optional small
 *  illustrative block. Fades/slides into place the first time it's scrolled
 *  into view (DESIGN.md §Motion: subtle only, respects prefers-reduced-motion
 *  globally via app.css). Each call is its own <section> — three of these
 *  side by side is three distinct blocks, not one section split into cards. */
function Advantage({
  icon,
  title,
  body,
  tone,
  decoration,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  tone: "plain" | "accent" | "muted";
  decoration?: ReactNode;
}) {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <section
      ref={ref}
      className={cn(
        "rounded-2xl p-5 transition-all duration-700 ease-out xs:p-6",
        tone === "accent" && "bg-accent-soft",
        tone === "muted" && "bg-surface-2",
        inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
    >
      <span
        className={cn(
          "icon-float flex h-14 w-14 items-center justify-center rounded-2xl text-accent",
          tone === "plain" ? "bg-accent-soft" : "bg-bg",
        )}
      >
        {icon}
      </span>
      <h2 className="mt-4 text-xl font-bold leading-snug">{title}</h2>
      <p className="mt-2 max-w-prose text-text-muted">{body}</p>
      {decoration}
    </section>
  );
}

/** Three-step "beginner -> architect" chip trail — the small illustrative
 *  block for the "learn" advantage. */
function LearnPathDecoration({ steps }: { steps: [string, string, string] }) {
  return (
    <div className="mt-4 flex items-center gap-1.5">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-1.5">
          <span className="whitespace-nowrap rounded-full border border-border bg-bg px-2.5 py-1 text-xs font-medium text-text-muted">
            {step}
          </span>
          {index < steps.length - 1 && (
            <span aria-hidden className="h-px w-3 bg-border" />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Marketing landing (Home tab). A hero, then three distinct full advantage
 * sections (learn / on-chain certificate / Telegram-native), each its own
 * <section> with a lightly animated reveal, then a single CTA to the
 * Learning tab (catalog). No section teasers or course previews — this is a
 * marketing page, not a catalog browser.
 */
export function HomeScreen() {
  const { t } = useT();
  const setTab = useAppStore((s) => s.setTab);

  return (
    <Screen withTabBar>
      {/* Hero */}
      <section className="pt-2 xs:pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          {t.landing.eyebrow}
        </p>
        <h1 className="mt-2 text-[26px] font-bold leading-tight xs:text-3xl">
          {t.landing.heroTitle}
        </h1>
        <p className="mt-3 max-w-prose text-text-muted">
          {t.landing.heroSubtitle}
        </p>
      </section>

      {/* Three distinct advantage sections */}
      <div className="mt-10 flex flex-col gap-4">
        <Advantage
          tone="plain"
          icon={<BookOpen className="h-6 w-6" />}
          title={t.landing.learnTitle}
          body={t.landing.learnBody}
          decoration={
            <LearnPathDecoration steps={t.landing.learnPathSteps} />
          }
        />
        <Advantage
          tone="accent"
          icon={<Award className="h-6 w-6" />}
          title={t.landing.certTitle}
          body={t.landing.certBody}
        />
        <Advantage
          tone="muted"
          icon={<MessageCircle className="h-6 w-6" />}
          title={t.landing.telegramTitle}
          body={t.landing.telegramBody}
        />
      </div>

      {/* CTA */}
      <section className="mt-10 pb-2">
        <Button size="lg" fullWidth onClick={() => setTab("learning")}>
          {t.landing.heroCta}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </section>
    </Screen>
  );
}
