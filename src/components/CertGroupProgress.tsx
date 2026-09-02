import { Award, Check, Clock } from "lucide-react";
import { useT } from "../i18n/useT";
import { format } from "../i18n/strings";
import { cn } from "../lib/cn";
import type { CertGroup, Section } from "../api/schemas";
import { ProgressBar } from "./ProgressBar";

function CertRow({
  group,
  requiredTitles,
}: {
  group: CertGroup;
  requiredTitles: string[];
}) {
  const { t } = useT();
  const need = group.minCoursesRequired;
  const done = Math.min(group.completedCourses, need);
  const unlocked = group.completedCourses >= need;
  const mintAvailable = group.mintAvailable ?? true;

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3">
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            unlocked ? "bg-accent text-on-accent" : "bg-accent-soft text-accent",
          )}
        >
          <Award className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-snug">{group.title}</p>
          <p className="mt-0.5 text-xs text-text-muted">
            {unlocked
              ? mintAvailable
                ? t.learning.certUnlocked
                : t.learning.certMintSoon
              : format(t.learning.certProgress, { done, need })}
          </p>
        </div>
        {unlocked ? (
          <Check className="mt-1 h-4 w-4 shrink-0 text-success" />
        ) : (
          <Clock className="mt-1 h-4 w-4 shrink-0 text-text-faint" />
        )}
      </div>
      <ProgressBar value={done} max={need} className="mt-3" />
      {requiredTitles.length > 0 && (
        <p className="mt-2 line-clamp-2 text-xs text-text-faint">
          {format(t.learning.certRequires, {
            n: need,
            total: requiredTitles.length,
          })}{" "}
          {requiredTitles.join(" · ")}
        </p>
      )}
    </div>
  );
}

/**
 * "Earn the certificate" block for a section. Uses the server's cert groups
 * (with the viewer's `completedCourses`) when present; before the backend
 * ships them it degrades to the informational one-liner it always showed.
 */
export function CertGroupProgress({ section }: { section: Section }) {
  const { t } = useT();
  const groups = section.certGroups ?? [];

  if (groups.length === 0) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-border bg-surface-2 p-3 text-sm text-text-muted">
        <Award className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <span>{format(t.learning.sectionCertHint, { section: section.title })}</span>
      </div>
    );
  }

  const titleBySlug = new Map(section.courses.map((c) => [c.slug, c.title]));
  return (
    <div className="flex flex-col gap-2">
      {groups.map((group) => (
        <CertRow
          key={group.slug}
          group={group}
          requiredTitles={group.requiredCourseSlugs
            .map((slug) => titleBySlug.get(slug))
            .filter((title): title is string => Boolean(title))}
        />
      ))}
    </div>
  );
}
