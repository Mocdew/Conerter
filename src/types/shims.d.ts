/**
 * Module declarations for markdown-it plugins that ship without bundled
 * TypeScript types. Kept intentionally loose — these plugins are registered via
 * `md.use(plugin, opts)` in WP-2 (`src/lib/markdown.ts`); the real typing comes
 * from `@types/markdown-it`'s `PluginSimple`/`PluginWithOptions` signatures.
 */

declare module 'markdown-it-task-lists' {
  import type { PluginWithOptions } from 'markdown-it';
  interface TaskListsOptions {
    enabled?: boolean;
    label?: boolean;
    labelAfter?: boolean;
  }
  const taskLists: PluginWithOptions<TaskListsOptions>;
  export default taskLists;
}

declare module 'markdown-it-table-of-contents' {
  import type { PluginWithOptions } from 'markdown-it';
  interface TocOptions {
    includeLevel?: number[];
    containerClass?: string;
    slugify?: (s: string) => string;
    markerPattern?: RegExp;
    listType?: 'ul' | 'ol';
    format?: (content: string) => string;
    containerHeaderHtml?: string;
    containerFooterHtml?: string;
    transformLink?: (link: string) => string;
  }
  const toc: PluginWithOptions<TocOptions>;
  export default toc;
}

declare module '@vscode/markdown-it-katex' {
  import type { PluginWithOptions } from 'markdown-it';
  const katexPlugin: PluginWithOptions<Record<string, unknown>>;
  export default katexPlugin;
}
