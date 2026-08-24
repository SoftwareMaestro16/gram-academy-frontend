import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Lesson body renderer. Content is trusted, pre-localized markdown from the
 * API. Raw HTML is disabled (`skipHtml`) — only basic markdown elements render,
 * styled by the `.reading` typography rules in styles/app.css. `remark-gfm`
 * adds table support (content authors use GFM tables; without this plugin
 * they render as a flat wall of `|`-delimited text).
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="reading">
      <ReactMarkdown skipHtml remarkPlugins={[remarkGfm]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
