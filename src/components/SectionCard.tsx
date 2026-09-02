import { Award, ChevronRight } from "lucide-react";
import { useT } from "../i18n/useT";
import { format } from "../i18n/strings";
import { themeForSection } from "../lib/sectionTheme";
import type { Section } from "../api/schemas";
import { Card } from "./Card";
import { MetaRow } from "./MetaRow";
import { ProgressBar } from "./ProgressBar";

/**
 * Catalog card for one curriculum section: a gradient icon tile themed by the
 * section, title, two-line description, "N courses · level · M free" meta and
 * — once the viewer has finished anything in it — a courses-completed bar.
 */
export function SectionCard({
  section,
  onClick,
}: {
  section: Section;
  onClick: () => void;
}) {
  const { t } = useT();
  const theme = themeForSection(section.slug, section.sortOrder);
  const Icon = theme.icon;
  const total = section.courses.length;
  const completed = section.courses.filter((c) => c.isCompleted).length;
  const free = section.courses.filter((c) => !c.isPaid).length;
  const minted = section.courses.some((c) => c.certificate === "minted");

  return (
    <Card onClick={onClick} className="group flex gap-3 xs:gap-4">
      <span
        className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-white xs:h-[72px] xs:w-[72px]"
        style={{ background: theme.gradient }}
      >
        <Icon
          aria-hidden
          className="absolute -bottom-3 -right-3 h-14 w-14 text-white/15"
          strokeWidth={1.25}
        />
        <Icon className="relative h-7 w-7" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug">{section.title}</h3>
          {minted ? (
            <Award className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          ) : (
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-text-faint transition-transform duration-150 group-hover:translate-x-0.5" />
          )}
        </div>
        {section.description && (
          <p className="mt-1 line-clamp-2 text-sm text-text-muted">
            {section.description}
          </p>
        )}
        <MetaRow
          className="mt-2"
          items={[
            format(t.learning.courses, { n: total }),
            t.learning.level[theme.level],
            free > 0 ? format(t.learning.freeCourses, { n: free }) : null,
          ]}
        />
        {completed > 0 && (
          <div className="mt-2.5 flex items-center gap-2">
            <ProgressBar value={completed} max={total} className="flex-1" />
            <span className="shrink-0 text-xs font-medium text-text-muted">
              {completed}/{total}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
