import { useEffect, useId, useRef, useState } from "react";
import type { default as Mermaid } from "mermaid";

// Dynamically imported (see below), not a static top-level import — mermaid
// pulls in every diagram type's renderer (sequence, gantt, ER, C4, KaTeX for
// math labels, cytoscape for some layouts...) and is multiple megabytes even
// gzipped. Almost every screen in this app (home, catalog, quiz, profile,
// even most lessons) never touches a diagram, so it must not land in the
// main bundle those screens all share.
let mermaidPromise: Promise<typeof Mermaid> | null = null;
function loadMermaid(): Promise<typeof Mermaid> {
  mermaidPromise ??= import("mermaid").then((m) => m.default);
  return mermaidPromise;
}

/** Reads the app's current theme tokens straight off :root so a diagram's
 *  colors always match the live theme (light/dark, and the accent itself)
 *  without hardcoding a second copy of the palette here. */
function readThemeVariables() {
  const styles = getComputedStyle(document.documentElement);
  const v = (name: string) => styles.getPropertyValue(name).trim();
  return {
    background: v("--surface"),
    primaryColor: v("--surface-2"),
    primaryTextColor: v("--text"),
    primaryBorderColor: v("--border"),
    lineColor: v("--text-muted"),
    secondaryColor: v("--accent-soft"),
    tertiaryColor: v("--surface"),
    textColor: v("--text"),
    mainBkg: v("--surface-2"),
    nodeBorder: v("--border"),
    clusterBkg: v("--surface"),
    clusterBorder: v("--border"),
    edgeLabelBackground: v("--surface"),
    fontFamily: styles.getPropertyValue("--font-sans").trim() || "inherit",
  };
}

/**
 * Renders a fenced ```mermaid block as an actual diagram (flowchart,
 * sequence, etc.) instead of plain text — used for the relationship/flow
 * diagrams content authors draw (e.g. election cycles, message choreography).
 * Falls back to the raw source in a plain block if the syntax doesn't parse,
 * so a malformed diagram never breaks the rest of the lesson.
 */
export function MermaidDiagram({ children }: { children: string }) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const themeVersion = useThemeVersion();

  useEffect(() => {
    let cancelled = false;
    loadMermaid()
      .then((mermaid) => {
        if (cancelled) return undefined;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: readThemeVariables(),
          securityLevel: "strict",
          fontFamily: "inherit",
        });
        return mermaid.render(`mermaid-${rawId}-${themeVersion}`, children.trim());
      })
      .then((result) => {
        if (!cancelled && result) {
          setSvg(result.svg);
          setFailed(false);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
    // themeVersion forces a re-render (new colors) on light/dark toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, rawId, themeVersion]);

  if (failed) {
    return (
      <pre className="overflow-x-auto rounded-xl bg-surface-2 p-4 text-sm">
        <code>{children}</code>
      </pre>
    );
  }

  return (
    <div
      className="my-6 flex justify-center overflow-x-auto rounded-xl border border-border bg-surface p-4"
      // Trusted: `svg` is mermaid's own render output from lesson content the
      // app already treats as trusted (LessonMarkdown disables raw HTML from
      // the markdown itself; this is a separate, library-generated string).
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}

/** Bumps whenever <html data-theme> changes, so MermaidDiagram re-renders
 *  with fresh colors — mermaid bakes colors into the SVG at render time, it
 *  can't pick up CSS variable changes on its own the way real CSS would. */
function useThemeVersion(): number {
  const [version, setVersion] = useState(0);
  const observed = useRef<string | null>(null);

  useEffect(() => {
    observed.current = document.documentElement.getAttribute("data-theme");
    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute("data-theme");
      if (current !== observed.current) {
        observed.current = current;
        setVersion((n) => n + 1);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return version;
}
