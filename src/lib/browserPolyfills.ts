import { Buffer } from "buffer";

// @ton/core and TonConnect expect Node's Buffer/global to exist in the browser.
// This module MUST be the very first import in main.tsx, before anything can pull
// in @ton/core (directly or transitively).
type GlobalWithShims = typeof globalThis & { Buffer?: typeof Buffer; global?: typeof globalThis };
const g = globalThis as GlobalWithShims;

if (typeof g.Buffer === "undefined") {
  g.Buffer = Buffer;
}
if (typeof g.global === "undefined") {
  g.global = globalThis;
}
