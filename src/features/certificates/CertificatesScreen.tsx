import { Award, Lock } from "lucide-react";
import { cn } from "../../lib/cn";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { MetaRow } from "../../components/MetaRow";
import { EmptyState, ErrorCard, Spinner, SkeletonList } from "../../components/StateViews";
import { useT } from "../../i18n/useT";
import { format } from "../../i18n/strings";
import { useSectionsQuery } from "../../api/queries";
import { useCertificateStatsQuery } from "../../api/certificates";
import { useAppStore } from "../../state/useAppStore";
import type { CourseSummary } from "../../api/schemas";

/** Summary card: certificate count + the "top N%" gamification framing
 *  (percentile is server-computed — higher is better; the client only
 *  flips it to a "top N%" phrasing via `100 - percentile`). */
function SummaryCard() {
  const { t } = useT();
  const { data, isPending, isError, refetch } = useCertificateStatsQuery();

  if (isPending) return <SkeletonList rows={1} />;
  if (isError || !data) {
    return (
      <Card>
        <ErrorCard onRetry={() => void refetch()} />
      </Card>
    );
  }

  const topPercent = Math.min(100, Math.max(0, Math.round(100 - data.percentile)));

  return (
    <Card featured>
      <div className="flex items-center gap-2 font-medium text-accent">
        <Award className="h-4 w-4" />
        {t.certificates.title}
      </div>
      <p className="mt-3 text-3xl font-bold">{data.myCount}</p>
      <p className="text-sm text-text-muted">{t.certificates.earned}</p>
      <p className="mt-3 text-sm font-medium text-accent">
        {data.myCount > 0
          ? format(t.certificates.topPercent, { n: topPercent })
          : t.certificates.firstOne}
      </p>
    </Card>
  );
}

function CertificateCard({
  course,
  onClick,
}: {
  course: CourseSummary;
  onClick: () => void;
}) {
  const { t } = useT();
  const meta = [
    format(t.section.lessons, { n: course.lessonCount }),
    format(t.section.quizzes, { n: course.quizCount }),
  ];

  const minted = course.certificate === "minted";
  const reserved = course.certificate === "reserved";

  return (
    <Card
      onClick={onClick}
      featured={minted}
      className={cn("flex flex-col", minted && "border-accent/40")}
    >
      <div className="flex items-center gap-3">
        <div
          className={
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl " +
            (minted
              ? "bg-accent text-on-accent"
              : reserved
                ? "bg-accent-soft text-accent"
                : "bg-surface-2 text-text-faint")
          }
        >
          {minted ? (
            <Award className="h-5 w-5" />
          ) : reserved ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
        </div>
        <h3
          className={cn(
            "min-w-0 flex-1 line-clamp-2 font-medium leading-snug",
            course.certificate === "none" ? "text-text-muted" : "text-text",
          )}
        >
          {course.title}
        </h3>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <MetaRow items={meta} />
        {minted && <Badge tone="accent">{t.certificates.unlocked}</Badge>}
        {reserved && <Badge tone="neutral">{t.certificates.inProgress}</Badge>}
        {course.certificate === "none" && (
          <Badge tone="muted">{t.certificates.locked}</Badge>
        )}
      </div>
    </Card>
  );
}

/** Certificates tab (spec addendum: dedicated section listing every
 *  certificate earned or still lockable, plus a percentile stat). Sourced
 *  from `useSectionsQuery()` — the same course list Home renders — since
 *  each `CourseSummary` already carries `certificate`. */
export function CertificatesScreen() {
  const { t } = useT();
  const setView = useAppStore((s) => s.setView);
  const { data, isPending, isError, refetch } = useSectionsQuery();

  return (
    <Screen withTabBar>
      <div className="mb-3 xs:mb-6">
        <h1 className="text-2xl font-bold">{t.certificates.title}</h1>
        <p className="mt-1 text-sm text-text-muted">{t.certificates.subtitle}</p>
      </div>

      <div className="mb-4 xs:mb-6">
        <SummaryCard />
      </div>

      {isPending ? (
        <SkeletonList rows={4} />
      ) : isError || !data ? (
        <ErrorCard onRetry={() => void refetch()} />
      ) : data.every((section) => section.courses.length === 0) ? (
        <EmptyState icon={<Award className="h-8 w-8" />} title={t.home.empty} />
      ) : (
        <div className="space-y-4 xs:space-y-7">
          {data.map((section) =>
            section.courses.length === 0 ? null : (
              <section key={section.slug}>
                <h2 className="mb-2 text-lg font-medium">{section.title}</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {section.courses.map((course) => (
                    <CertificateCard
                      key={course.slug}
                      course={course}
                      onClick={() => setView({ name: "course", slug: course.slug })}
                    />
                  ))}
                </div>
              </section>
            ),
          )}
        </div>
      )}
    </Screen>
  );
}
