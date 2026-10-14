// WP-3 — Rendered, sanitized HTML output. The `.markdown-body` wrapper is the
// contract WP-5's github-markdown.css styles and WP-4's export reuses.

import { EmptyIcon } from './icons';

interface PreviewProps {
  html: string;
}

const PILLS = ['Tables', 'Task lists', 'Code highlighting', 'Math', 'Export to HTML'];

export default function Preview({ html }: PreviewProps) {
  return (
    <div className="preview">
      {html.trim() ? (
        <article
          className="markdown-body"
          // html is already sanitized by lib/sanitize before it reaches here.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">
            <EmptyIcon />
          </div>
          <h2>Your preview appears here</h2>
          <p>Start typing Markdown on the left, or drop a .md file — it renders instantly.</p>
          <ul className="empty-state__pills">
            {PILLS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
