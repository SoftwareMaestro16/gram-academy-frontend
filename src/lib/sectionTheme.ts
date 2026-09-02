import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  Coins,
  Cpu,
  CodeXml,
  GraduationCap,
  Layers,
  Network,
  Rocket,
  Server,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

/** Difficulty tier shown on section/course cards. Derived client-side from
 *  the section (the catalog is ordered beginner → expert); the API carries
 *  no `level` field, so this is presentation only. */
export type CourseLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface SectionTheme {
  icon: LucideIcon;
  level: CourseLevel;
  /** CSS `background` for the card cover — two-stop diagonal gradient, dark
   *  enough for white text/icons on top in both themes. */
  gradient: string;
  /** Solid accent used for small tints (e.g. an icon tile on a light card). */
  accent: string;
}

// One theme per curriculum section (server slugs — see seeds/courses/*.json in
// the backend repo). Anything not listed falls back to a hue derived from the
// slug (`themeForSection`), so a new section still gets a distinct, on-brand
// cover before this table is updated.
const THEMES: Record<string, SectionTheme> = {
  "ton-newcomers": {
    icon: Rocket,
    level: "beginner",
    gradient: "linear-gradient(135deg, #1f8fe6 0%, #4f46e5 100%)",
    accent: "#1f8fe6",
  },
  "tokens-and-assets": {
    icon: Coins,
    level: "beginner",
    gradient: "linear-gradient(135deg, #d97706 0%, #ea580c 100%)",
    accent: "#d97706",
  },
  "fragment-and-telegram": {
    icon: ShoppingBag,
    level: "beginner",
    gradient: "linear-gradient(135deg, #db2777 0%, #9333ea 100%)",
    accent: "#db2777",
  },
  "trading-defi-earning": {
    icon: TrendingUp,
    level: "intermediate",
    gradient: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
    accent: "#059669",
  },
  "crypto-security": {
    icon: ShieldCheck,
    level: "intermediate",
    gradient: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
    accent: "#dc2626",
  },
  "validators-and-consensus": {
    icon: Server,
    level: "intermediate",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)",
    accent: "#7c3aed",
  },
  "dev-foundations": {
    icon: CodeXml,
    level: "intermediate",
    gradient: "linear-gradient(135deg, #0891b2 0%, #2563eb 100%)",
    accent: "#0891b2",
  },
  "advanced-contracts": {
    icon: Layers,
    level: "advanced",
    gradient: "linear-gradient(135deg, #c026d3 0%, #7c3aed 100%)",
    accent: "#c026d3",
  },
  "architecture-deep-dive": {
    icon: Cpu,
    level: "expert",
    gradient: "linear-gradient(135deg, #334155 0%, #1d4ed8 100%)",
    accent: "#1d4ed8",
  },
  "protocol-engineering": {
    icon: Network,
    level: "expert",
    gradient: "linear-gradient(135deg, #4f46e5 0%, #0f172a 100%)",
    accent: "#4f46e5",
  },
  "production-engineering": {
    icon: Boxes,
    level: "advanced",
    gradient: "linear-gradient(135deg, #16a34a 0%, #0f766e 100%)",
    accent: "#16a34a",
  },
  // Legacy collection slugs (pre-curriculum sections) — keep them themed too.
  "ton-basics": {
    icon: Rocket,
    level: "beginner",
    gradient: "linear-gradient(135deg, #1f8fe6 0%, #4f46e5 100%)",
    accent: "#1f8fe6",
  },
  "ton-assets": {
    icon: Coins,
    level: "beginner",
    gradient: "linear-gradient(135deg, #d97706 0%, #ea580c 100%)",
    accent: "#d97706",
  },
};

function hashHue(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

function levelForSortOrder(sortOrder: number | undefined): CourseLevel {
  if (sortOrder === undefined) return "beginner";
  if (sortOrder <= 3) return "beginner";
  if (sortOrder <= 7) return "intermediate";
  if (sortOrder <= 8) return "advanced";
  return "expert";
}

/** Theme for a section slug. Unknown slugs get a deterministic hue so two
 *  unlisted sections never look identical. */
export function themeForSection(slug: string, sortOrder?: number): SectionTheme {
  const known = THEMES[slug];
  if (known) return known;
  const hue = hashHue(slug);
  return {
    icon: GraduationCap,
    level: levelForSortOrder(sortOrder),
    gradient: `linear-gradient(135deg, hsl(${hue} 70% 42%) 0%, hsl(${(hue + 40) % 360} 70% 32%) 100%)`,
    accent: `hsl(${hue} 70% 42%)`,
  };
}
