# Markdown → HTML Converter — Build Plan

A web-based application that converts a `.md` file into a standalone `.html` file, with a
live editor and a rich feature set. Runs **fully in the browser** (no backend) — uploaded
files never leave the user's machine.

- **Stack:** Vite + React + TypeScript
- **Conversion engine:** `markdown-it` (produces an HTML string that feeds both the live
  preview and the downloadable file from one code path)
- **Target directory:** `/Users/mac/Documents/Conerter`

---

## Functionalities

**Core + GFM**
- Two-pane live editor: Markdown input ↔ rendered HTML preview (debounced, real-time)
- Load a `.md` file via file picker **and** drag-and-drop
- GitHub Flavored Markdown: tables, task lists, strikethrough, autolinks
- Download the result as a standalone `.html` file

**Syntax highlighting**
- Fenced code blocks highlighted with highlight.js (auto + explicit language)

**Themes & styling**
- Light/dark UI toggle, persisted in `localStorage`
- GitHub-style preview CSS (light & dark)
- Export produces a self-contained HTML document with all CSS inlined (works offline)

**Extras**
- Copy rendered HTML / full document to clipboard
- Print / Save-as-PDF (print-optimized stylesheet)
- XSS-safe output: HTML sanitized with DOMPurify
- Live stats: word count, character count, reading time
- Auto-generated Table of Contents (toggle)
- Math rendering via KaTeX (`$inline$`, `$$block$$`)
- Sample document loaded on first visit

---

## Target project structure

```
Conerter/
  index.html
  package.json
  vite.config.ts
  tsconfig.json
  src/
    main.tsx
    App.tsx                     # layout, state, theme, wiring
    components/
      Toolbar.tsx               # upload, download, copy, print, theme/TOC toggles, stats
      Editor.tsx                # Markdown input
      Preview.tsx               # sanitized HTML output
      DropZone.tsx              # drag-and-drop .md
    lib/
      markdown.ts               # markdown-it + plugins + highlight.js
      exportHtml.ts             # standalone HTML doc with inlined CSS
      sanitize.ts               # DOMPurify wrapper
      stats.ts                  # word / char count, reading time
    hooks/
      useDebounce.ts
      useLocalStorage.ts
    styles/
      app.css
      github-markdown.css
      print.css
    types/
      shims.d.ts                # module declarations for untyped plugins
```

---

## Work breakdown (by engineer)

Packages are ordered by dependency. WP-1 unblocks everything; WP-2/WP-3/WP-6 can run in
parallel once the scaffold exists; WP-4/WP-5 depend on the components; WP-7 is continuous.

### WP-1 — Project scaffold & tooling
**Engineer: Build / Frontend Tooling Engineer**
- Scaffold Vite + React + TypeScript project.
- Create `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`.
- Add and pin dependencies:
  - runtime: `react`, `react-dom`, `markdown-it`, `highlight.js`, `dompurify`,
    `markdown-it-task-lists`, `markdown-it-anchor`, `markdown-it-table-of-contents`,
    `katex`, `@vscode/markdown-it-katex`
  - dev: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`,
    `@types/markdown-it`, `@types/dompurify`
- Add `src/types/shims.d.ts` for plugins without bundled types.
- **Done when:** `npm install` succeeds and `npm run dev` serves a blank React app with no console errors.

### WP-2 — Markdown conversion engine
**Engineer: Frontend Developer (core/library)**
- `src/lib/markdown.ts`: single configured `markdown-it` instance
  (`{ html: true, linkify: true, typographer: true }`), `highlight` option wired to
  highlight.js, plus plugins: task-lists, anchor + table-of-contents, KaTeX.
- Export `render(md: string): string`.
- `src/lib/stats.ts`: `getStats(md)` → `{ words, chars, readingTimeMin }`.
- **Done when:** given a Markdown string with headings, table, task list, fenced code and
  math, `render()` returns correct HTML (unit-testable, no React needed).
- **Depends on:** WP-1.

### WP-3 — Editor, Preview & app layout
**Engineer: Frontend Developer (React UI)**
- `src/components/Editor.tsx` (Markdown `<textarea>`), `src/components/Preview.tsx`
  (renders sanitized HTML), `src/App.tsx` (two-pane layout, `markdown` state, debounced
  derived HTML via `useDebounce`).
- `src/hooks/useDebounce.ts`.
- **Done when:** typing Markdown on the left updates the rendered preview on the right in
  real time.
- **Depends on:** WP-1, WP-2 (`render`), WP-6 (`sanitize`).

### WP-4 — File I/O: upload, drag-drop, export
**Engineer: Frontend Developer (features)**
- `src/components/DropZone.tsx` + file-picker: read `.md` via `FileReader`, handle wrong
  file types gracefully.
- `src/lib/exportHtml.ts`: wrap sanitized body in a full `<!doctype html>` document with
  github-markdown CSS, highlight.js theme CSS and KaTeX CSS inlined; download via Blob +
  object URL.
- `src/components/Toolbar.tsx`: wire up Download HTML, Copy HTML, Copy full document, Print.
- **Done when:** a `.md` file loads via both picker and drag-drop; Download produces a
  standalone `.html` that renders correctly when opened directly in a browser.
- **Depends on:** WP-3, WP-5 (CSS to inline), WP-6 (sanitize).

### WP-5 — Theming & styling
**Engineer: Frontend / UI-CSS Designer**
- `src/styles/app.css` (app shell, light/dark CSS variables), `github-markdown.css`
  (preview theme, light & dark), `print.css`.
- Light/dark toggle persisted via `src/hooks/useLocalStorage.ts`.
- Responsive two-pane → stacked layout on narrow screens; empty-state styling.
- **Done when:** toggling theme restyles app + preview and survives reload; print preview
  shows only the rendered document.
- **Depends on:** WP-1; coordinates with WP-3/WP-4 on class names.

### WP-6 — Sanitization & security
**Engineer: Security / Frontend Engineer**
- `src/lib/sanitize.ts`: DOMPurify wrapper allowing KaTeX + highlight.js markup while
  stripping scripts/event handlers. Applied before preview **and** before export.
- **Done when:** a `<script>` / `onerror=` payload in Markdown does not execute in preview
  or in the exported file.
- **Depends on:** WP-1; consumed by WP-3 and WP-4.

### WP-7 — QA, verification & docs
**Engineer: QA Engineer + Technical Writer**
- Manual + (optional) unit tests covering: live preview, GFM features, syntax highlighting,
  math, upload (picker + drag-drop), standalone export, theme persistence, copy, print,
  sanitization.
- Write `README.md`: what it does, how to run (`npm install`, `npm run dev`, `npm run build`),
  feature list, browser support.
- **Done when:** all verification steps below pass and the README is complete.
- **Depends on:** all other WPs.

---

## Verification (end-to-end)

1. `npm install`, then `npm run dev`; open the served URL.
2. Paste Markdown with headings, a table, a task list, a fenced code block and `$$x^2$$`;
   confirm each renders correctly and updates live.
3. Load a `.md` file via drag-drop and via the file picker.
4. Click **Download HTML**; open the saved file directly in a browser — confirm it renders
   standalone (styles, highlighting, math) with no external requests.
5. Toggle light/dark and reload; confirm the theme persists.
6. Verify copy-to-clipboard, print preview, word-count stats and TOC generation.
7. Inject a `<script>`/`onerror=` payload; confirm it does not execute.

---

## Dependency graph (quick reference)

```
WP-1 (scaffold)
 ├── WP-2 (engine) ──┐
 ├── WP-6 (sanitize) ┤
 ├── WP-5 (styling) ─┤
 │                   ▼
 └────────────► WP-3 (editor/preview/app)
                     │
                     ▼
                WP-4 (file I/O + export)
                     │
                     ▼
                WP-7 (QA + docs)
```
