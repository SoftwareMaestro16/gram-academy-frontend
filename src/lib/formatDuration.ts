/** Splits a whole-course duration estimate (minutes, server-provided) into a
 *  display value + unit, without owning any copy: the caller maps `unit` to a
 *  localized template (`learning.hoursMeta` / `learning.minutesMeta`). Pure so
 *  it can be unit-tested. Under an hour it reads in minutes; from an hour up it
 *  reads in hours rounded to the nearest half (e.g. 150 → "2.5", 60 → "1"). */
export function durationParts(minutes: number): {
  value: string;
  unit: "hours" | "minutes";
} | null {
  if (!Number.isFinite(minutes) || minutes <= 0) return null;

  if (minutes >= 60) {
    const halves = Math.round((minutes / 60) * 2) / 2;
    const value = Number.isInteger(halves) ? String(halves) : halves.toFixed(1);
    return { value, unit: "hours" };
  }

  return { value: String(Math.max(1, Math.round(minutes))), unit: "minutes" };
}
