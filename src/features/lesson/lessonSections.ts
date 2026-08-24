/**
 * Generic in-lesson section navigation. Parses ATX markdown headings (`#`..
 * `######`) out of a lesson body and splits the body into heading-anchored
 * chunks, so the reader can jump between sections ("On this page") without any
 * per-lesson code. Fenced code blocks (``` / ~~~) are skipped so a `#` comment
 * inside a code sample is never mistaken for a heading.
 */

export interface LessonSection {
  /** Slug-derived, de-duplicated id (no prefix — see `sectionDomId`). */
  id: string;
  title: string;
  /** Heading level 1–6. */
  level: number;
}

interface LessonBodyChunk {
  heading: LessonSection;
  /** Markdown for this section, starting at its heading line. */
  content: string;
}

export interface ParsedLessonBody {
  /** Markdown before the first heading (may be empty). */
  preamble: string;
  sections: LessonBodyChunk[];
}

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const FENCE_RE = /^\s*(```|~~~)/;

/** DOM id for a section wrapper / anchor target. Namespaced so lesson anchors
 *  never collide with other element ids on the page. */
export function sectionDomId(id: string): string {
  return `lesson-sec-${id}`;
}

/** Lowercase, strip inline markdown/punctuation, hyphenate. Letters (incl. CJK)
 *  survive, so a Chinese heading keeps its text as the id; only a title that
 *  slugifies to nothing (e.g. punctuation-only) falls back to a positional id. */
function slugify(title: string, index: number): string {
  const slug = title
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `section-${index + 1}`;
}

/** Parses the body into a preamble + heading-anchored sections. Ids are unique
 *  within the returned set. */
export function parseLessonBody(body: string): ParsedLessonBody {
  const lines = body.split(/\r?\n/);
  const preambleLines: string[] = [];
  const sections: LessonBodyChunk[] = [];
  const usedIds = new Map<string, number>();
  let inFence = false;
  let current: { heading: LessonSection; lines: string[] } | null = null;

  const flush = () => {
    if (current) {
      sections.push({ heading: current.heading, content: current.lines.join("\n") });
      current = null;
    }
  };

  for (const line of lines) {
    if (FENCE_RE.test(line)) inFence = !inFence;

    const match = inFence ? null : HEADING_RE.exec(line);
    if (match) {
      flush();
      const level = match[1]?.length ?? 1;
      const title = (match[2] ?? "").trim();
      let id = slugify(title, sections.length);
      const seen = usedIds.get(id);
      if (seen !== undefined) {
        usedIds.set(id, seen + 1);
        id = `${id}-${seen + 1}`;
      } else {
        usedIds.set(id, 0);
      }
      current = { heading: { id, title, level }, lines: [line] };
    } else if (current) {
      current.lines.push(line);
    } else {
      preambleLines.push(line);
    }
  }
  flush();

  return { preamble: preambleLines.join("\n").trim(), sections };
}
