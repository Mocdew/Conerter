# Markdown → HTML Converter

A browser-based app that turns a Markdown document into a **standalone, self-contained
`.html` file** — with a live two-pane editor and a rich rendering feature set. It runs
**entirely in your browser**: uploaded files never leave your machine and the exported
document works offline with no external requests.

Built with **Vite + React + TypeScript**, using [`markdown-it`](https://github.com/markdown-it/markdown-it)
as the single conversion engine that feeds both the live preview and the downloadable file.

## Features

- **Live two-pane editor** — Markdown on the left, rendered HTML preview on the right,
  updated in real time (debounced).
- **Load a `.md` file** via the file picker *or* drag-and-drop; non-`.md` files are
  rejected gracefully.
- **GitHub Flavored Markdown** — tables, task lists, strikethrough, autolinks.
- **Syntax highlighting** of fenced code blocks via [highlight.js](https://highlightjs.org/)
  (explicit language or auto-detected).
- **Math rendering** via [KaTeX](https://katex.org/) — `$inline$` and `$$block$$`.
- **Auto-generated Table of Contents** (toggle).
- **Light / dark theme**, persisted in `localStorage`; the preview and code-block
  highlighting both follow the theme.
- **Standalone HTML export** — all CSS (github-markdown, highlight.js theme, KaTeX)
  inlined into one file that renders correctly when opened directly in a browser.
- **Copy to clipboard** — the rendered HTML fragment or the full standalone document.
- **Print / Save-as-PDF** with a print-optimized stylesheet.
- **Live stats** — word count, character count, estimated reading time.
- **XSS-safe output** — HTML is sanitized with [DOMPurify](https://github.com/cure53/DOMPurify)
  before it reaches the preview *and* before it is written into the exported file, so a
  `<script>` or `onerror=` payload in the Markdown never executes.
- A **sample document** is loaded on first visit.

## Getting started

Requires Node.js 18+ (for Vite 5 and Vitest 2).

```bash
npm install     # install dependencies
npm run dev      # start the dev server (prints a local URL)
```

### Other scripts

```bash
npm run build    # type-check (tsc) then produce a production build in dist/
npm run preview  # serve the production build locally
npm test         # run the test suite once (Vitest)
npm run test:watch   # run the tests in watch mode
```

## Project layout

```
src/
  main.tsx                 # React entry point
  App.tsx                  # layout, state, theme, wiring
  components/              # Toolbar, Editor, Preview, DropZone
  lib/
    markdown.ts            # markdown-it + plugins + highlight.js  (render)
    exportHtml.ts          # standalone HTML document with inlined CSS
    sanitize.ts            # DOMPurify wrapper
    stats.ts               # word / char count, reading time
  hooks/                   # useDebounce, useLocalStorage
  styles/                  # app, github-markdown, print CSS
  types/shims.d.ts         # module declarations for untyped plugins
tests/
  markdown.test.ts         # render + stats verification (Vitest)
src/lib/sanitize.test.ts   # sanitization / XSS tests (Vitest)
```

## Browser support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari). The app targets ES2020 and
uses the Clipboard API; copy-to-clipboard requires a secure context (`https://` or
`localhost`).

## Privacy

Everything runs client-side. Files you open are read in the browser with `FileReader`
and are never uploaded; the exported HTML inlines all styles so it has no external
dependencies.
