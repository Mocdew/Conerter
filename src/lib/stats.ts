// WP-2 — document statistics for the Toolbar live stats (WP-3).
//
// Pure functions over the raw Markdown source. No React, no DOM.

/** Average adult silent reading speed, in words per minute. */
const WORDS_PER_MINUTE = 200;

export interface Stats {
  /** Whitespace-delimited word count. */
  words: number;
  /** Total character count, including whitespace. */
  chars: number;
  /** Estimated reading time in minutes (0 when empty, otherwise ≥ 1). */
  readingTimeMin: number;
}

/**
 * Compute word/character counts and an estimated reading time for a Markdown
 * source string. Operates on the source as written (Markdown syntax included),
 * which is the conventional, cheap, and stable choice for a live counter.
 */
export function getStats(src: string): Stats {
  const text = src ?? '';
  const chars = text.length;
  const words = (text.trim().match(/\S+/g) ?? []).length;
  const readingTimeMin = words === 0 ? 0 : Math.max(1, Math.round(words / WORDS_PER_MINUTE));

  return { words, chars, readingTimeMin };
}

export default getStats;
