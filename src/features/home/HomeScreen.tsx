import type { ReactNode } from "react";
import { ArrowRight, Award, BookOpen, Gift, Globe } from "lucide-react";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { MetaRow } from "../../components/MetaRow";
import { SectionImage } from "../../components/SectionImage";
import { useT } from "../../i18n/useT";
import { format } from "../../i18n/strings";
import { useSectionsQuery } from "../../api/queries";
import { useAppStore } from "../../state/useAppStore";
import type { Section } from "../../api/schemas";

/** One value-prop tile: icon in an accent-soft badge, title, short body. */
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

/** Compact teaser card for a learning section on the landing page. */
function SectionTeaser({
  section,
  onClick,
}: {
  section: Section;
  onClick: () => void;
}) {
  const { t } = useT();
  return (
    <Card onClick={onClick} className="flex flex-col">
      <SectionImage slug={section.slug} className="h-28" />
      <h3 className="mt-3 font-medium leading-snug">{section.title}</h3>
      <MetaRow
        className="mt-1"
        items={[format(t.learning.courses, { n: section.courses.length })]}
      />
    </Card>
  );
}

/**
 * Marketing landing (Home tab). A hero that explains what Gram Academy is,
 * a grid of value props, and a teaser of the learning sections — with CTAs
 * into the Learning catalog. The catalog itself now lives on the Learning
 * tab (`LearningScreen`); this screen never blocks on the sections fetch, so
 * a slow/failed content request still leaves a usable landing page.
 */
export function HomeScreen() {
  const { t } = useT();
  const setTab = useAppStore((s) => s.setTab);
  const setView = useAppStore((s) => s.setView);
  const { data } = useSectionsQuery();

  const teaserSections = (data ?? []).slice(0, 3);

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
        <div className="mt-5">
          <Button size="lg" onClick={() => setTab("learning")}>
            {t.landing.heroCta}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Value props */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">{t.landing.featuresHeading}</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            icon={<Gift className="h-5 w-5" />}
            title={t.landing.referralTitle}
            body={t.landing.referralBody}
          />
          <Feature
            icon={<Globe className="h-5 w-5" />}
            title={t.landing.multilingualTitle}
            body={t.landing.multilingualBody}
          />
        </div>
      </section>

      {/* Sections teaser — only when content is available */}
      {teaserSections.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">{t.landing.sectionsHeading}</h2>
          <p className="mt-1 text-sm text-text-muted">
            {t.landing.sectionsSubtitle}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {teaserSections.map((section) => (
              <SectionTeaser
                key={section.slug}
                section={section}
                onClick={() =>
                  setView({ name: "section", sectionSlug: section.slug })
                }
              />
            ))}
          </div>
          <div className="mt-5">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => setTab("learning")}
            >
              {t.landing.browseAll}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      )}
    </Screen>
  );
}
