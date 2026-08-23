import { Award, ClipboardCheck, FileText, Lock, Play } from "lucide-react";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Badge";
import { Card } from "../../components/Card";
import { MetaRow } from "../../components/MetaRow";
import { PriceTag } from "../../components/PriceTag";
import { ProgressBar } from "../../components/ProgressBar";
import { RoadmapList } from "../../components/RoadmapList";
import { ErrorCard, SkeletonList } from "../../components/StateViews";
import { useT } from "../../i18n/useT";
import { format } from "../../i18n/strings";
import { useCourseQuery } from "../../api/queries";
import { useAppStore, type AppView } from "../../state/useAppStore";
import type { CourseDetail } from "../../api/schemas";

/** Contextual primary action + certificate status (DESIGN.md §Course detail). */
function CtaBlock({
  course,
  onOpenTarget,
}: {
  course: CourseDetail;
  onOpenTarget: () => void;
}) {
  const { t } = useT();

  if (course.locked) {
    return (
      <div>
        <Button variant="primary" fullWidth disabled title="Wave 2">
          <Lock className="h-4 w-4" />
          {format(t.course.buy, { n: course.discountedPriceStars })}
        </Button>
        <p className="mt-2 text-center text-xs text-text-muted">
          {t.course.purchaseSoon}
        </p>
      </div>
    );
  }

  if (course.certificate === "minted") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-accent/40 bg-accent-soft px-4 py-3 text-sm text-accent">
        <Award className="h-4 w-4" />
        {t.course.certificateMinted}
      </div>
    );
  }

  if (course.certificate === "reserved") {
    return (
      <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-muted">
        {t.course.certificatePending}
      </div>
    );
  }

  if (course.isCompleted) {
    // Wave 2 wires wallet connect + mint; disabled placeholder until then.
    return (
      <Button variant="primary" fullWidth disabled title="Wave 2">
        <Award className="h-4 w-4" />
        {t.course.getCertificate}
      </Button>
    );
  }

  const started = course.lessons.some((l) => l.completed);
  return (
    <Button variant="primary" fullWidth onClick={onOpenTarget}>
      <Play className="h-4 w-4" />
      {started ? t.course.continueLearning : t.course.start}
    </Button>
  );
}

export function CourseScreen({ slug }: { slug: string }) {
  const { t } = useT();
  const goBack = useAppStore((s) => s.goBack);
  const setView = useAppStore((s) => s.setView);
  const { data: course, isPending, isError, refetch } = useCourseQuery(slug);

  if (isPending) {
    return (
      <Screen onBack={goBack} withTabBar>
        <SkeletonList rows={4} />
      </Screen>
    );
  }
  if (isError || !course) {
    return (
      <Screen onBack={goBack} withTabBar>
        <ErrorCard onRetry={() => void refetch()} />
      </Screen>
    );
  }

  const completedLessons = course.lessons.filter((l) => l.completed).length;
  const started = completedLessons > 0;

  const openTarget = () => {
    const nextLesson =
      course.lessons.find((l) => !l.completed) ?? course.lessons[0];
    if (nextLesson) {
      setView({ name: "lesson", courseSlug: slug, lessonId: nextLesson.id });
      return;
    }
    const firstQuiz = course.quizzes[0];
    if (firstQuiz) {
      setView({ name: "quiz", courseSlug: slug, quizId: firstQuiz.id });
    }
  };

  const openView = (view: AppView) => setView(view);

  return (
    <Screen onBack={goBack} withTabBar>
      <h1 className="text-[28px] font-bold leading-tight">{course.title}</h1>

      {course.description && (
        <p className="mt-2 text-text-muted">{course.description}</p>
      )}

      <MetaRow
        className="mt-3"
        items={[
          format(t.section.lessons, { n: course.lessonCount }),
          format(t.section.quizzes, { n: course.quizCount }),
          <PriceTag
            key="price"
            isPaid={course.isPaid}
            priceStars={course.priceStars}
            discountedPriceStars={course.discountedPriceStars}
          />,
          t.course.certificateMeta,
        ]}
      />

      {!course.locked && started && !course.isCompleted && (
        <div className="mt-4">
          <ProgressBar value={completedLessons} max={course.lessonCount} />
          <p className="mt-1 text-xs text-text-muted">
            {format(t.section.progress, {
              done: completedLessons,
              total: course.lessonCount,
            })}
          </p>
        </div>
      )}

      <div className="mt-5">
        <CtaBlock course={course} onOpenTarget={openTarget} />
      </div>

      {course.locked ? (
        <Card className="mt-7">
          <h2 className="text-sm font-semibold text-text-muted">
            {t.course.whatsInside}
          </h2>
          <MetaRow
            className="mt-2"
            items={[
              <span key="l" className="inline-flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {format(t.section.lessons, { n: course.lessonCount })}
              </span>,
              <span key="q" className="inline-flex items-center gap-1">
                <ClipboardCheck className="h-3.5 w-3.5" />
                {format(t.section.quizzes, { n: course.quizCount })}
              </span>,
              t.course.certificateMeta,
            ]}
          />
        </Card>
      ) : (
        <section className="mt-7">
          <h2 className="mb-2 text-sm font-semibold text-text-muted">
            {t.course.roadmap}
          </h2>
          <RoadmapList
            lessons={course.lessons}
            quizzes={course.quizzes}
            onSelectLesson={(id) =>
              openView({ name: "lesson", courseSlug: slug, lessonId: id })
            }
            onSelectQuiz={(id) =>
              openView({ name: "quiz", courseSlug: slug, quizId: id })
            }
          />
        </section>
      )}
    </Screen>
  );
}
