import { Award } from "lucide-react";
import { Screen } from "../../components/Screen";
import { CourseCard } from "../../components/CourseCard";
import { SectionImage } from "../../components/SectionImage";
import { EmptyState, ErrorCard, SkeletonList } from "../../components/StateViews";
import { useT } from "../../i18n/useT";
import { format } from "../../i18n/strings";
import { useSectionsQuery } from "../../api/queries";
import { useAppStore } from "../../state/useAppStore";

/**
 * Section detail. There is no per-section endpoint (§13.5) — the section and
 * its courses come from the already-cached GET /v1/sections response (same
 * query key as the Learning catalog). Shows a hero (image + description + the
 * section's certificate-condition line) above a grid of course cards.
 */
export function SectionScreen({ sectionSlug }: { sectionSlug: string }) {
  const { t } = useT();
  const goBack = useAppStore((s) => s.goBack);
  const setView = useAppStore((s) => s.setView);
  const { data, isPending, isError, refetch } = useSectionsQuery();

  const section = data?.find((s) => s.slug === sectionSlug);

  return (
    <Screen title={section?.title} onBack={goBack} withTabBar>
      {section && (
        <div className="mb-4 xs:mb-6">
          <SectionImage
            slug={section.slug}
            className="h-32 xs:h-44"
          />
          {section.description && (
            <p className="mt-3 text-sm text-text-muted xs:text-base">
              {section.description}
            </p>
          )}
          {/* Section-level certificate grouping isn't exposed by the API yet
           *  (§13.5 only carries per-course `certificate` + price); this is an
           *  informational line built from the fields we do have. */}
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-surface-2 p-3 text-sm text-text-muted">
            <Award className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>
              {format(t.learning.sectionCertHint, { section: section.title })}
            </span>
          </div>
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
