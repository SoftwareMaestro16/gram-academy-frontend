import { GraduationCap } from "lucide-react";
import { Screen } from "../../components/Screen";
import { Logo } from "../../components/Logo";
import { ThemeToggle } from "../../components/ThemeToggle";
import { CourseCard } from "../../components/CourseCard";
import { EmptyState, ErrorCard, SkeletonList } from "../../components/StateViews";
import { useT } from "../../i18n/useT";
import { useSectionsQuery } from "../../api/queries";
import { useAppStore } from "../../state/useAppStore";

/**
 * Catalog home (DESIGN.md §Home): branded header, screen title + intro, then
 * each section with its course cards. Tapping a card opens the course detail.
 */
export function HomeScreen() {
  const { t } = useT();
  const setView = useAppStore((s) => s.setView);
  const { data, isPending, isError, refetch } = useSectionsQuery();

  return (
    <Screen withTabBar>
      <div className="safe-top flex items-center justify-between pb-2 pt-1">
        <Logo />
        <ThemeToggle className="-mr-2" />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t.home.title}</h1>
        <p className="mt-1 text-sm text-text-muted">{t.home.subtitle}</p>
      </div>

      {isPending ? (
        <SkeletonList rows={4} />
      ) : isError ? (
        <ErrorCard onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="h-8 w-8" />}
          title={t.home.empty}
        />
      ) : (
        <div className="space-y-7">
          {data.map((section) => (
            <section key={section.slug}>
              <h2 className="mb-1 text-lg font-medium">{section.title}</h2>
              {section.description && (
                <p className="mb-3 text-sm text-text-muted">
                  {section.description}
                </p>
              )}
              {section.courses.length === 0 ? (
                <p className="text-sm text-text-faint">{t.section.empty}</p>
              ) : (
                <div className="space-y-3">
                  {section.courses.map((course) => (
                    <CourseCard
                      key={course.slug}
                      course={course}
                      onClick={() =>
                        setView({ name: "course", slug: course.slug })
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </Screen>
  );
}
