// Sample document shown on first visit (WP-2/WP-3 fixture — exercises every feature).

export const SAMPLE = `# Markdown → HTML Converter

A quick tour of what this tool renders. Edit anything on the left.

## Features

- **GitHub Flavored Markdown** — tables, task lists, ~~strikethrough~~, autolinks
- Syntax highlighting via highlight.js
- Math via KaTeX
- Export to a standalone \`.html\` file

### Task list

- [x] Live two-pane preview
- [x] Light / dark theme
- [ ] Your next edit

### Table

| Feature | Supported |
| ------- | :-------: |
| Tables  | ✅        |
| Code    | ✅        |
| Math    | ✅        |

### Code

\`\`\`ts
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Math

Inline $E = mc^2$ and a display block:

$$\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}$$

> Drop a \`.md\` file onto the editor, or paste your own Markdown to begin.

Autolink: https://github.com
`;

export default SAMPLE;
