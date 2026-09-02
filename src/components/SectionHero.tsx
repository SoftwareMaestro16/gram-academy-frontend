import { useT } from "../i18n/useT";
import { format } from "../i18n/strings";
import { themeForSection } from "../lib/sectionTheme";
import type { Section } from "../api/schemas";

/**
 * Section-detail banner: the section's gradient with a large icon watermark,
 * level pill, title and description. Replaces the old best-effort NFT-art
 * image (which only existed for two legacy slugs and fell back to a blank
 * placeholder for every real section).
 */
export function SectionHero({ section }: { section: Section }) {
  const { t } = useT();
  const theme = themeForSection(section.slug, section.sortOrder);
  const Icon = theme.icon;
  const total = section.courses.length;
  const completed = section.courses.filter((c) => c.isCompleted).length;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 text-white xs:p-5"
      style={{ background: theme.gradient }}
    >
      <Icon
        aria-hidden
        className="absolute -bottom-8 -right-6 h-40 w-40 text-white/15"
        strokeWidth={1}
      />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm">
            {t.learning.level[theme.level]}
          </span>
          <span className="rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm">
            {format(t.learning.courses, { n: total })}
          </span>
          {completed > 0 && (
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-accent">
              {format(t.learning.completedCourses, { done: completed, total })}
            </span>
          )}
        </div>
        <h2 className="mt-3 text-xl font-bold leading-tight xs:text-2xl">
          {section.title}
        </h2>
        {section.description && (
          <p className="mt-2 max-w-prose text-sm text-white/85 xs:text-base">
            {section.description}
          </p>
        )}
      </div>
    </div>
  );
}
