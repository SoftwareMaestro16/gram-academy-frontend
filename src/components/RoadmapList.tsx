import { useEffect, useRef, useState } from "react";
import { Circle, CircleCheck } from "lucide-react";
import { cn } from "../lib/cn";
import { Badge } from "./Badge";
import { useT } from "../i18n/useT";

export interface RoadmapLesson {
  id: string;
  title: string;
  completed: boolean;
}
export interface RoadmapQuiz {
  id: string;
  title: string;
  completed: boolean;
  passed: boolean;
}

function Row({
  title,
  done,
  current,
  onClick,
  trailing,
}: {
  title: string;
  done: boolean;
  current?: boolean;
  onClick: () => void;
  trailing?: React.ReactNode;
}) {
  // Pop the checkmark in with a brief scale animation the moment this row
  // flips incomplete -> complete (e.g. after finishing the lesson it
  // represents), instead of on every render where it's already done.
  const wasDone = useRef(done);
  const [justCompleted, setJustCompleted] = useState(false);
  useEffect(() => {
    const flippedToDone = !wasDone.current && done;
    wasDone.current = done;
    if (!flippedToDone) return;
    setJustCompleted(true);
    const timer = window.setTimeout(() => setJustCompleted(false), 500);
    return () => window.clearTimeout(timer);
  }, [done]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={current ? "step" : undefined}
      className={cn(
        "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150",
        current ? "bg-surface-2" : "hover:bg-surface-2",
      )}
    >
      {done ? (
        <CircleCheck
          className={cn(
            "h-5 w-5 shrink-0 text-success",
            justCompleted && "check-pop",
          )}
        />
      ) : (
        <Circle
          className={cn(
            "h-5 w-5 shrink-0",
            current ? "text-accent" : "text-text-faint",
          )}
        />
      )}
      {/* min-w-0 so the inner truncate can actually shrink; trailing sits
         right next to the title (not pushed to the row's far edge). */}
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className={cn(
            "min-w-0 truncate text-sm",
            current ? "font-medium text-text" : "text-text",
          )}
        >
          {title}
        </span>
        {trailing}
      </span>
    </button>
  );
}

/** The course as an ordered checklist: lessons then final quiz(zes)
 *  (DESIGN.md §RoadmapList). */
export function RoadmapList({
  lessons,
  quizzes,
  currentLessonId,
  onSelectLesson,
  onSelectQuiz,
}: {
  lessons: RoadmapLesson[];
  quizzes: RoadmapQuiz[];
  currentLessonId?: string;
  onSelectLesson: (id: string) => void;
  onSelectQuiz: (id: string) => void;
}) {
  const { t } = useT();
  return (
    <div className="space-y-0.5">
      {lessons.map((lesson) => (
        <Row
          key={lesson.id}
          title={lesson.title}
          done={lesson.completed}
          current={lesson.id === currentLessonId}
          onClick={() => onSelectLesson(lesson.id)}
        />
      ))}
      {quizzes.map((quiz) => (
        <Row
          key={quiz.id}
          title={quiz.title || t.course.quiz}
          done={quiz.passed}
          onClick={() => onSelectQuiz(quiz.id)}
          trailing={
            quiz.passed ? <Badge tone="success">{t.course.completed}</Badge> : null
          }
        />
      ))}
    </div>
  );
}
