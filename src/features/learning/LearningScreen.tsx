import { GraduationCap } from "lucide-react";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { MetaRow } from "../../components/MetaRow";
import { SectionImage } from "../../components/SectionImage";
import { EmptyState, ErrorCard, SkeletonList } from "../../components/StateViews";
import { useT } from "../../i18n/useT";
import { format } from "../../i18n/strings";
import { useSectionsQuery } from "../../api/queries";
import { useAppStore } from "../../state/useAppStore";
import type { Section } from "../../api/schemas";

/** One catalog card per section (image + title + description + course
 *  count) — tapping drills into `SectionScreen`, which lists that section's
 *  courses with the usual lesson/time/quiz/price/progress meta. */
function SectionCard({
  section,
  onClick,
}: {
  section: Section;
  onClick: () => void;
}) {
  const { t } = useT();
  return (
    <Card onClick={onClick} className="flex flex-col">
      <SectionImage slug={section.slug} />
      <h3 className="mt-3 font-medium leading-snug">{section.title}</h3>
      {section.description && (
        <p className="mt-1 line-clamp-2 text-sm text-text-muted">
          {section.description}
        </p>
      )}
      <MetaRow
        className="mt-2"
        items={[format(t.learning.courses, { n: section.courses.length })]}
      />
    </Card>
  );
}

/**
 * Learning catalog (the section grid that used to live on Home, now its own
 * tab). Screen title + intro, then a grid of section cards. Tapping a card
 * opens that section's course list (`SectionScreen`). The branded logo +
 * wallet control live in the persistent site `Header` (rendered once by
 * `AppShell`), not duplicated here.
 */
export function LearningScreen() {
  const { t } = useT();
  const setView = useAppStore((s) => s.setView);
  const { data, isPending, isError, refetch } = useSectionsQuery();

  return (
    <Screen withTabBar>
      <div className="mb-3 xs:mb-6">
        <h1 className="text-2xl font-bold">{t.learning.title}</h1>
        <p className="mt-1 text-sm text-text-muted">{t.learning.subtitle}</p>
      </div>

      {isPending ? (
        <SkeletonList rows={4} />
      ) : isError ? (
        <ErrorCard onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="h-8 w-8" />}
          title={t.learning.empty}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((section) => (
            <SectionCard
              key={section.slug}
              section={section}
              onClick={() =>
                setView({ name: "section", sectionSlug: section.slug })
              }
            />
          ))}
        </div>
      )}
    </Screen>
  );
}
