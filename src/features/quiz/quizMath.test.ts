import { describe, expect, it } from "vitest";
import { formatDuration, minCorrectAnswers } from "./quizMath";

describe("minCorrectAnswers", () => {
  // Table from QUIZ-INTEGRITY.md §Pass threshold.
  it.each([
    [4, 3],
    [5, 4],
    [6, 4],
    [7, 5],
    [8, 6],
    [10, 7],
  ])("N=%i -> minCorrect=%i", (total, expected) => {
    expect(minCorrectAnswers(total)).toBe(expected);
  });
});

describe("formatDuration", () => {
  it("formats seconds under a minute", () => {
    expect(formatDuration(7)).toBe("0:07");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(65)).toBe("1:05");
  });

  it("formats a full hour (the fail cooldown)", () => {
    expect(formatDuration(3600)).toBe("60:00");
  });

  it("clamps negative input to zero", () => {
    expect(formatDuration(-5)).toBe("0:00");
  });
});
