import { describe, expect, it } from "vitest";
import { durationParts } from "./formatDuration";

describe("durationParts", () => {
  it("returns null for absent / non-positive / non-finite input", () => {
    expect(durationParts(0)).toBeNull();
    expect(durationParts(-10)).toBeNull();
    expect(durationParts(Number.NaN)).toBeNull();
  });

  it("reads sub-hour durations in whole minutes (min 1)", () => {
    expect(durationParts(30)).toEqual({ value: "30", unit: "minutes" });
    expect(durationParts(59)).toEqual({ value: "59", unit: "minutes" });
    expect(durationParts(0.4)).toEqual({ value: "1", unit: "minutes" });
  });

  it("reads hour+ durations in hours rounded to the nearest half", () => {
    expect(durationParts(60)).toEqual({ value: "1", unit: "hours" });
    expect(durationParts(150)).toEqual({ value: "2.5", unit: "hours" });
    expect(durationParts(75)).toEqual({ value: "1.5", unit: "hours" }); // 1.25 → 1.5
    expect(durationParts(105)).toEqual({ value: "2", unit: "hours" }); // 1.75 → 2
    expect(durationParts(120)).toEqual({ value: "2", unit: "hours" });
  });
});
