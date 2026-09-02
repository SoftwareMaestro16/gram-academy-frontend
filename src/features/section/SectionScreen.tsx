import { Screen } from "../../components/Screen";
import { CourseCard } from "../../components/CourseCard";
import { SectionHero } from "../../components/SectionHero";
import { CertGroupProgress } from "../../components/CertGroupProgress";
import { EmptyState, ErrorCard, SkeletonList } from "../../components/StateViews";
import { useT } from "../../i18n/useT";
import { themeForSection } from "../../lib/sectionTheme";
import { useSectionsQuery } from "../../api/queries";
import { useAppStore } from "../../state/useAppStore";

/**
 * Section detail. There is no per-section endpoint (§13.5) — the section and
 * its courses come from the already-cached GET /v1/sections response (same
 * query key as the Learning catalog). Shows a themed hero + the section's
 * certificate progress above a grid of course cards.
 */
export function SectionScreen({ sectionSlug }: { sectionSlug: string }) {
  const { t } = useT();
  const goBack = useAppStore((s) => s.goBack);
  const setView = useAppStore((s) => s.setView);
  const { data, isPending, isError, refetch } = useSectionsQuery();

  const section = data?.find((s) => s.slug === sectionSlug);
  const theme = section ? themeForSection(section.slug, section.sortOrder) : undefined;

  return (
    <Screen title={section?.title} onBack={goBack} withTabBar>
      {section && (
        <div className="mb-4 flex flex-col gap-3 xs:mb-6">
          <SectionHero section={section} />
          <CertGroupProgress section={section} />
        </div>
      )}

      {isPending ? (
        <SkeletonList rows={3} />
      ) : isError ? (
        <ErrorCard onRetry={() => void refetch()} />
      ) : !section || section.courses.length === 0 ? (
        <EmptyState title={t.section.empty} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {section.courses.map((course, i) => (
            <CourseCard
              key={course.slug}
              course={course}
              index={i + 1}
              sectionSlug={section.slug}
              theme={theme}
              onClick={() => setView({ name: "course", slug: course.slug })}
            />
          ))}
        </div>
      )}
    </Screen>
  );
}
