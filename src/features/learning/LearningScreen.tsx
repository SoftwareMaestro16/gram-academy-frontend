import { GraduationCap } from "lucide-react";
import { Screen } from "../../components/Screen";
import { SectionCard } from "../../components/SectionCard";
import { EmptyState, ErrorCard, SkeletonList } from "../../components/StateViews";
import { useT } from "../../i18n/useT";
import { format } from "../../i18n/strings";
import { useSectionsQuery } from "../../api/queries";
import { useAppStore } from "../../state/useAppStore";

/**
 * Learning catalog (the section list that used to live on Home, now its own
 * tab). Screen title + intro, then one themed card per section. Tapping a
 * card opens that section's course list (`SectionScreen`). The branded logo +
 * wallet control live in the persistent site `Header` (rendered once by
 * `AppShell`), not duplicated here.
 */
export function LearningScreen() {
  const { t } = useT();
  const setView = useAppStore((s) => s.setView);
  const { data, isPending, isError, refetch } = useSectionsQuery();

  const courseCount = data?.reduce((sum, s) => sum + s.courses.length, 0) ?? 0;

  return (
    <Screen withTabBar>
      <div className="mb-3 xs:mb-6">
        <h1 className="text-2xl font-bold">{t.learning.title}</h1>
        <p className="mt-1 text-sm text-text-muted">
          {data && data.length > 0
            ? format(t.learning.catalogSummary, {
                sections: data.length,
                courses: courseCount,
              })
            : t.learning.subtitle}
        </p>
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
