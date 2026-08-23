import { Check } from "lucide-react";
import { useT } from "../i18n/useT";
import { format } from "../i18n/strings";
import type { CourseSummary } from "../api/schemas";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { MetaRow } from "./MetaRow";
import { PriceTag } from "./PriceTag";
import { ProgressBar } from "./ProgressBar";

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
    <Card onClick={onClick}>
      <div className="flex items-start gap-3">
        <img
          src="/gram-diamond.svg"
          alt=""
          aria-hidden
          className="mt-0.5 h-6 w-6 shrink-0"
        />
        <div className="min-w-0 flex-1">
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
              <ProgressBar
                value={course.completedLessons}
                max={course.lessonCount}
              />
              <p className="mt-1 text-xs text-text-muted">
                {format(t.section.progress, {
                  done: course.completedLessons,
                  total: course.lessonCount,
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
