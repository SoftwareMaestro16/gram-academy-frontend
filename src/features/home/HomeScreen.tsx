import type { ReactNode } from "react";
import { ArrowRight, Award, BookOpen, Globe2, MessageCircle } from "lucide-react";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { useT } from "../../i18n/useT";
import { useAppStore } from "../../state/useAppStore";
import { useInView } from "../../lib/useInView";
import { cn } from "../../lib/cn";

/** Shared scroll-reveal wrapper: fades/slides the first time it enters the
 *  viewport (one-shot). DESIGN.md §Motion: subtle only, respects
 *  prefers-reduced-motion globally via app.css. */
function Reveal({
  as: As = "section",
  className,
  children,
}: {
  as?: "section" | "div";
  className?: string;
  children: ReactNode;
}) {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <As
      ref={ref as never}
      className={cn(
        "transition-all duration-700 ease-out",
        inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
    >
      {children}
    </As>
  );
}

/** One full advantage section: icon badge, title, body, and an optional small
 *  illustrative block. Each call is its own <section> — three of these side
 *  by side is three distinct blocks, not one section split into cards. */
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
  return (
    <Reveal
      className={cn(
        "rounded-2xl p-5 xs:p-6",
        tone === "accent" && "bg-accent-soft",
        tone === "muted" && "bg-surface-2",
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
    </Reveal>
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

/** "How it works" — a vertical 4-step process with a connecting line.
 *  Each step reveals in sequence as the section scrolls into view. */
function HowItWorks({
  title,
  body,
  steps,
}: {
  title: string;
  body: string;
  steps: readonly { title: string; body: string }[];
}) {
  return (
    <Reveal className="rounded-2xl bg-surface-2 p-5 xs:p-6">
      <h2 className="text-xl font-bold leading-snug">{title}</h2>
      <p className="mt-1 text-text-muted">{body}</p>
      <ol className="mt-5 flex flex-col">
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute left-4 top-9 h-[calc(100%-2rem)] w-px -translate-x-1/2 bg-border"
              />
            )}
            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent">
              {index + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <h3 className="font-medium leading-snug">{step.title}</h3>
              <p className="mt-0.5 text-sm text-text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}

/** Curriculum breadth — the 10 real section titles as a chip cloud, so a
 *  reader can see the platform's actual scope at a glance. */
function Curriculum({
  title,
  body,
  topics,
}: {
  title: string;
  body: string;
  topics: readonly string[];
}) {
  return (
    <Reveal className="rounded-2xl p-5 xs:p-6">
      <h2 className="text-xl font-bold leading-snug">{title}</h2>
      <p className="mt-1 max-w-prose text-text-muted">{body}</p>
      <div className="mt-4 grid grid-cols-1 gap-2 xs:grid-cols-2">
        {topics.map((topic, index) => (
          <div
            key={topic}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-bold text-accent">
              {index + 1}
            </span>
            {topic}
          </div>
        ))}
      </div>
    </Reveal>
  );
}

/**
 * Marketing landing (Home tab). A hero, a short platform explainer, three
 * distinct advantage sections, a "how it works" process, the curriculum's
 * real breadth, a languages note, then a single CTA to the Learning tab.
 * Each block is its own <section> with a lightly animated scroll reveal —
 * this is a marketing page meant to be read and scrolled through, not a
 * catalog browser (no course previews here).
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

      {/* What is Gram Academy */}
      <Reveal className="mt-8">
        <p className="max-w-prose text-lg leading-relaxed">
          <span className="font-semibold">{t.landing.introTitle}.</span>{" "}
          <span className="text-text-muted">{t.landing.introBody}</span>
        </p>
      </Reveal>

      {/* Three distinct advantage sections */}
      <div className="mt-8 flex flex-col gap-4">
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

      {/* How it works */}
      <div className="mt-4">
        <HowItWorks
          title={t.landing.howTitle}
          body={t.landing.howBody}
          steps={t.landing.howSteps}
        />
      </div>

      {/* Curriculum breadth */}
      <div className="mt-4">
        <Curriculum
          title={t.landing.curriculumTitle}
          body={t.landing.curriculumBody}
          topics={t.landing.curriculumTopics}
        />
      </div>

      {/* Languages */}
      <Reveal className="mt-4 rounded-2xl p-5 xs:p-6">
        <span className="icon-float flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <Globe2 className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-xl font-bold leading-snug">
          {t.landing.languagesTitle}
        </h2>
        <p className="mt-2 max-w-prose text-text-muted">
          {t.landing.languagesBody}
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-text-muted">
          <span>EN</span>
          <span aria-hidden>·</span>
          <span>RU</span>
          <span aria-hidden>·</span>
          <span>ZH</span>
        </div>
      </Reveal>

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
