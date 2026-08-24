import { Check } from "lucide-react";
import { useT } from "../i18n/useT";
import { format } from "../i18n/strings";
import { durationParts } from "../lib/formatDuration";
import type { CourseSummary } from "../api/schemas";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { MetaRow } from "./MetaRow";
import { PriceTag } from "./PriceTag";
import { ProgressBar } from "./ProgressBar";
import { SectionImage } from "./SectionImage";

/** Certificate/status badge for a course card. */
function StatusBadge({ course }: { course: CourseSummary }) {
  const { t } = useT();
  if (course.certificate === "minted") {
    return <Badge tone="accent">{t.course.certificateMinted}</Badge>;
  }
  if (course.isCompleted) {
    return (
      <Badge tone="success">
        <Check className="h-3 w-3" />
        {t.course.completed}
      </Badge>
    );
  }
  return null;
}

/** Localized "estimated time" meta chip — omitted entirely when the server
 *  hasn't provided `estimatedMinutes` yet (graceful pre-deploy fallback). */
function timeMeta(
  course: CourseSummary,
  t: ReturnType<typeof useT>["t"],
): string | null {
  if (course.estimatedMinutes === undefined) return null;
  const parts = durationParts(course.estimatedMinutes);
  if (!parts) return null;
  const template =
    parts.unit === "hours" ? t.learning.hoursMeta : t.learning.minutesMeta;
  return format(template, { n: parts.value });
}

export function CourseCard({
  course,
  onClick,
}: {
  course: CourseSummary;
  onClick: () => void;
}) {
  const { t } = useT();
  const showProgress =
    course.lessonCount > 0 &&
    course.completedLessons > 0 &&
    !course.isCompleted;

  return (
    <Card onClick={onClick} className="flex flex-col">
      {/* Per-course art has no dedicated endpoint yet; SectionImage best-effort
       *  loads NFT art by slug and falls back to an on-brand placeholder. */}
      <SectionImage slug={course.slug} className="mb-3 h-32 xs:h-36" />

      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium leading-snug">{course.title}</h3>
        <div className="shrink-0">
          <StatusBadge course={course} />
        </div>
      </div>

      {course.description && (
        <p className="mt-1 line-clamp-2 text-sm text-text-muted">
          {course.description}
        </p>
      )}

      <MetaRow
        className="mt-2"
        items={[
          format(t.section.lessons, { n: course.lessonCount }),
          timeMeta(course, t),
          format(t.section.quizzes, { n: course.quizCount }),
          <PriceTag
            key="price"
            isPaid={course.isPaid}
            priceStars={course.priceStars}
            discountedPriceStars={course.discountedPriceStars}
          />,
        ]}
      />

      {showProgress && (
        <div className="mt-3">
          <ProgressBar value={course.completedLessons} max={course.lessonCount} />
          <p className="mt-1 text-xs text-text-muted">
            {format(t.section.progress, {
              done: course.completedLessons,
              total: course.lessonCount,
            })}
          </p>
        </div>
      )}
    </Card>
  );
}
