import ReactMarkdown from "react-markdown";

/**
 * Lesson body renderer. Content is trusted, pre-localized markdown from the
 * API. Raw HTML is disabled (`skipHtml`) — only basic markdown elements render,
 * styled by the `.reading` typography rules in styles/app.css.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="reading">
      <ReactMarkdown skipHtml>{children}</ReactMarkdown>
    </div>
  );
}
