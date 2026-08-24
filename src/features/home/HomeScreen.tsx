import type { ReactNode } from "react";
import { ArrowRight, Award, BookOpen, MessageCircle } from "lucide-react";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { useT } from "../../i18n/useT";
import { useAppStore } from "../../state/useAppStore";

/** One value-prop section: icon in an accent-soft badge, title, short body. */
function Feature({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Card className="flex flex-col gap-2">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
        {icon}
      </span>
      <h3 className="font-medium leading-snug">{title}</h3>
      <p className="text-sm text-text-muted">{body}</p>
    </Card>
  );
}

/**
 * Marketing landing (Home tab). A hero with the Gram Academy tagline, three
 * value-prop sections (learn, certificates, Telegram), and a single CTA that
 * navigates to the Learning tab (catalog). No section teasers or course
 * previews — this is a marketing page, not a catalog browser.
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

      {/* Value props */}
      <section className="mt-10 grid grid-cols-1 gap-3">
        <Feature
          icon={<BookOpen className="h-5 w-5" />}
          title={t.landing.learnTitle}
          body={t.landing.learnBody}
        />
        <Feature
          icon={<Award className="h-5 w-5" />}
          title={t.landing.certTitle}
          body={t.landing.certBody}
        />
        <Feature
          icon={<MessageCircle className="h-5 w-5" />}
          title={t.landing.telegramTitle}
          body={t.landing.telegramBody}
        />
      </section>

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
