import { describe, expect, it } from "vitest";
import { parseLessonBody, sectionDomId } from "./lessonSections";

describe("parseLessonBody", () => {
  it("returns the whole body as preamble when there are no headings", () => {
    const body = "Just a paragraph.\n\nAnd another one.";
    const parsed = parseLessonBody(body);
    expect(parsed.sections).toHaveLength(0);
    expect(parsed.preamble).toBe(body);
  });

  it("splits into heading-anchored sections and keeps leading text as preamble", () => {
    const body = ["Intro line.", "", "# First", "a", "", "## Second", "b"].join("\n");
    const parsed = parseLessonBody(body);
    expect(parsed.preamble).toBe("Intro line.");
    expect(parsed.sections.map((s) => s.heading.title)).toEqual(["First", "Second"]);
    expect(parsed.sections.map((s) => s.heading.level)).toEqual([1, 2]);
    // Each chunk starts at its own heading line.
    expect(parsed.sections[0]?.content.startsWith("# First")).toBe(true);
    expect(parsed.sections[1]?.content.startsWith("## Second")).toBe(true);
  });

  it("ignores `#` lines inside fenced code blocks", () => {
    const body = ["# Real heading", "```", "# not a heading", "```", "text"].join("\n");
    const parsed = parseLessonBody(body);
    expect(parsed.sections).toHaveLength(1);
    expect(parsed.sections[0]?.heading.title).toBe("Real heading");
    // The fenced `#` line stays part of the section content.
    expect(parsed.sections[0]?.content).toContain("# not a heading");
  });

  it("de-duplicates ids for repeated heading titles", () => {
    const body = ["## Setup", "a", "## Setup", "b"].join("\n");
    const ids = parseLessonBody(body).sections.map((s) => s.heading.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps CJK heading text as the id (letters survive slugification)", () => {
    const parsed = parseLessonBody("# 测验\ntext");
    expect(parsed.sections[0]?.heading.id).toBe("测验");
  });

  it("falls back to a positional id when a heading slugifies to nothing", () => {
    const parsed = parseLessonBody("# !!!\ntext");
    expect(parsed.sections[0]?.heading.id).toBe("section-1");
  });

  it("namespaces DOM ids so lesson anchors don't collide with page ids", () => {
    expect(sectionDomId("intro")).toBe("lesson-sec-intro");
  });
});
