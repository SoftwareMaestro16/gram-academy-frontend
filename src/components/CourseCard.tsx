import { Award, Check, ChevronRight, Lock } from "lucide-react";
import { useT } from "../i18n/useT";
import { format } from "../i18n/strings";
import { cn } from "../lib/cn";
import { durationParts } from "../lib/formatDuration";
import { themeForSection, type SectionTheme } from "../lib/sectionTheme";
import type { CourseSummary } from "../api/schemas";
import { Card } from "./Card";
import { MetaRow } from "./MetaRow";
import { PriceTag } from "./PriceTag";
import { ProgressBar } from "./ProgressBar";

/** Small translucent pill rendered on top of the gradient cover. */
function CoverPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Completion / certificate / lock state, shown top-right of the cover. */
function StatusPill({ course }: { course: CourseSummary }) {
  const { t } = useT();
  if (course.certificate === "minted") {
    return (
      <CoverPill className="bg-white/90 text-accent">
        <Award className="h-3 w-3" />
        {t.course.certificateMinted}
      </CoverPill>
    );
  }
  if (course.isCompleted) {
    return (
      <CoverPill className="bg-success text-white">
        <Check className="h-3 w-3" />
        {t.course.completed}
      </CoverPill>
    );
  }
  if (course.isPaid && !course.isPurchased) {
    return (
      <CoverPill>
        <Lock className="h-3 w-3" />
        {t.learning.locked}
      </CoverPill>
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

/**
 * Course card (DESIGN.md §Card). A gradient cover themed by the course's
 * section (icon watermark, "Course N" + level pills, status pill), then the
 * title, a two-line description, the lessons/time/quizzes meta row, the price
 * and — once started — a progress bar. The whole card is one tap target.
 */
export function CourseCard({
  course,
  index,
  sectionSlug,
  theme: themeOverride,
  onClick,
}: {
  course: CourseSummary;
  /** 1-based position inside its section (rendered as "Course N"). */
  index: number;
  sectionSlug: string;
  theme?: SectionTheme | undefined;
  onClick: () => void;
}) {
  const { t } = useT();
  const theme = themeOverride ?? themeForSection(sectionSlug);
  const Icon = theme.icon;
  const showProgress =
    course.lessonCount > 0 &&
    course.completedLessons > 0 &&
    !course.isCompleted;

  return (
    <Card onClick={onClick} className="group flex flex-col overflow-hidden p-0 xs:p-0">
      {/* Cover */}
      <div
        className="relative h-28 w-full overflow-hidden xs:h-32"
        style={{ background: theme.gradient }}
      >
        <Icon
          aria-hidden
          className="absolute -bottom-5 -right-4 h-28 w-28 text-white/15 transition-transform duration-300 group-hover:scale-110"
          strokeWidth={1.25}
        />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <CoverPill>{format(t.learning.courseIndex, { n: index })}</CoverPill>
            <CoverPill>{t.learning.level[theme.level]}</CoverPill>
          </div>
          <StatusPill course={course} />
        </div>
        <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white ring-1 ring-white/30 backdrop-blur-sm">
          <Icon className="h-5 w-5" />
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3 xs:p-4">
        <h3 className="text-[15px] font-semibold leading-snug xs:text-base">
          {course.title}
        </h3>
        {course.description && (
          <p className="mt-1 line-clamp-2 text-sm text-text-muted">
            {course.description}
          </p>
        )}

        <MetaRow
          className="mt-2.5"
          items={[
            format(t.section.lessons, { n: course.lessonCount }),
            timeMeta(course, t),
            format(t.section.quizzes, { n: course.quizCount }),
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

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <PriceTag
            isPaid={course.isPaid}
            priceStars={course.priceStars}
            discountedPriceStars={course.discountedPriceStars}
          />
          <span className="inline-flex items-center gap-0.5 text-sm font-medium text-accent">
            {course.isCompleted
              ? t.course.reviewCourse
              : course.completedLessons > 0
                ? t.course.continueLearning
                : t.learning.open}
            <ChevronRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Card>
  );
}
