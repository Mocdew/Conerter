// WP-2 verification suite (handed to WP-7). Runs under Vitest, the same runner
// as src/lib/sanitize.test.ts, via `npm test`.
//
// Lives outside `src/` so it stays out of the app's `tsc && vite build`.
//
// Exercises the plan's "Done when": headings, a table, a task list, a fenced
// code block, and block math all render to the expected HTML shapes.

import { test, expect } from 'vitest';
import { render } from '../src/lib/markdown';
import { getStats } from '../src/lib/stats';

const SOURCE = `# Title

## Section

| a | b |
|---|---|
| 1 | 2 |

- [x] done
- [ ] todo

\`\`\`js
const x = 1;
\`\`\`

$$x^2$$
`;

test('render: headings get slug anchors', () => {
  const html = render(SOURCE);
  expect(html).toMatch(/<h1[^>]*id="title"/);
  expect(html).toMatch(/<h2[^>]*id="section"/);
});

test('render: GFM table', () => {
  const html = render(SOURCE);
  expect(html).toMatch(/<table>/);
  expect(html).toMatch(/<th>a<\/th>/);
});

test('render: task list (two boxes, one checked)', () => {
  const html = render(SOURCE);
  // Attribute order is plugin-defined; assert count + state, not order.
  const boxes = html.match(/task-list-item-checkbox/g) ?? [];
  const checked = html.match(/task-list-item-checkbox"\s*checked/g) ?? [];
  expect(boxes.length).toBe(2);
  expect(checked.length).toBe(1);
});

test('render: fenced code highlighted with hljs', () => {
  const html = render(SOURCE);
  expect(html).toMatch(/<pre class="hljs"><code class="language-js">/);
  expect(html).toMatch(/hljs-keyword/); // `const` tokenized
});

test('render: block math produces KaTeX markup', () => {
  const html = render(SOURCE);
  expect(html).toMatch(/katex/);
});

test('getStats: words, chars, reading time', () => {
  const s = getStats('one two three');
  expect(s.words).toBe(3);
  expect(s.chars).toBe(13);
  expect(s.readingTimeMin).toBe(1);
  expect(getStats('')).toEqual({ words: 0, chars: 0, readingTimeMin: 0 });
});
