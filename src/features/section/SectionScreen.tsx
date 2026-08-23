import { Screen } from "../../components/Screen";
import { CourseCard } from "../../components/CourseCard";
import { EmptyState, ErrorCard, SkeletonList } from "../../components/StateViews";
import { useT } from "../../i18n/useT";
import { useSectionsQuery } from "../../api/queries";
import { useAppStore } from "../../state/useAppStore";

/**
 * Section detail. There is no per-section endpoint (§13.5) — the courses come
 * from the already-cached GET /v1/sections response (same query key as Home).
 */
export function SectionScreen({ sectionSlug }: { sectionSlug: string }) {
  const { t } = useT();
  const goBack = useAppStore((s) => s.goBack);
  const setView = useAppStore((s) => s.setView);
  const { data, isPending, isError, refetch } = useSectionsQuery();

  const section = data?.find((s) => s.slug === sectionSlug);

  return (
    <Screen title={section?.title} onBack={goBack} withTabBar>
      {isPending ? (
        <SkeletonList rows={3} />
      ) : isError ? (
        <ErrorCard onRetry={() => void refetch()} />
      ) : !section || section.courses.length === 0 ? (
        <EmptyState title={t.section.empty} />
      ) : (
        <div className="space-y-3">
          {section.courses.map((course) => (
            <CourseCard
              key={course.slug}
              course={course}
              onClick={() => setView({ name: "course", slug: course.slug })}
            />
          ))}
        </div>
      )}
    </Screen>
  );
}
