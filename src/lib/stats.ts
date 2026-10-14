// WP-2 — Live document stats.

export interface Stats {
  words: number;
  chars: number;
  readingTimeMin: number;
}

const WORDS_PER_MIN = 200;

/** Word count, character count and estimated reading time for raw Markdown. */
export function getStats(md: string): Stats {
  const text = md ?? '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return {
    words,
    chars: text.length,
    readingTimeMin: Math.max(words > 0 ? 1 : 0, Math.ceil(words / WORDS_PER_MIN)),
  };
}

export default getStats;
