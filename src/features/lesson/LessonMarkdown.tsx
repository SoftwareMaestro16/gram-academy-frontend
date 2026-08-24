import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { MermaidDiagram } from "./MermaidDiagram";

/**
 * Lesson body renderer. Same reading typography as the shared `Markdown`
 * (`.reading` in styles/app.css), plus a polished custom `img` renderer so a
 * content author can drop a standard `![caption](url)` image at ANY point in a
 * lesson body and it renders well with zero renderer changes: constrained
 * width, rounded corners, breathing room, lazy-loaded, and — when the alt text
 * is non-empty — a small centered caption beneath it. Themed via tokens only.
 *
 * Content is trusted, pre-localized markdown from the API; raw HTML stays
 * disabled (`skipHtml`).
 */
const components: Components = {
  // A fenced ```mermaid block renders as a real diagram instead of plain
  // text — for the relationship/flow diagrams content authors draw (election
  // cycles, message choreography, etc). Every other fenced language (bash,
  // tolk, json, plain text arrows...) falls through to the default <pre><code>
  // handling, styled by .reading pre/code in app.css.
  code({ className, children }) {
    const language = /language-(\w+)/.exec(className ?? "")?.[1];
    if (language === "mermaid") {
      return <MermaidDiagram>{String(children)}</MermaidDiagram>;
    }
    return <code className={className}>{children}</code>;
  },
  // Markdown always wraps a fenced block's `code` in `pre` — but MermaidDiagram
  // renders its own block-level container (a div, not text), so skip the
  // <pre> wrapper specifically for that case; every other language keeps it.
  pre({ children }) {
    const child = Array.isArray(children) ? children[0] : children;
    const isMermaid =
      typeof child === "object" && child !== null && "type" in child && child.type === MermaidDiagram;
    if (isMermaid) return <>{children}</>;
    return <pre>{children}</pre>;
  },
  // GFM tables can be wider than the reading column on narrow screens —
  // scroll the table itself instead of letting it force the whole page wide.
  table({ children }) {
    return (
      <div className="my-6 overflow-x-auto rounded-xl border border-border">
        <table>{children}</table>
      </div>
    );
  },
  img({ src, alt, title }) {
    const caption = (alt ?? "").trim();
    return (
      <figure className="my-6">
        <img
          src={typeof src === "string" ? src : undefined}
          alt={caption}
          title={title}
          loading="lazy"
          className="mx-auto block max-w-full rounded-xl"
        />
        {caption && (
          <figcaption className="mt-2 text-center text-xs text-text-muted">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  },
};

export function LessonMarkdown({ children }: { children: string }) {
  return (
    <div className="reading reading-lesson">
      <ReactMarkdown skipHtml remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
