import { useCallback, useEffect, useState } from 'react';

/**
 * Persist a piece of React state in localStorage.
 *
 * - Reads the initial value from storage on mount (falling back to `initialValue`).
 * - Writes back on every change.
 * - Tolerates private-mode / blocked storage: every access is wrapped in try/catch,
 *   so the hook degrades to plain in-memory state instead of throwing.
 * - Syncs across tabs via the `storage` event, unless `sync: false` is passed.
 *
 * Cross-tab sync is right for small settings (theme, layout), but harmful for a
 * value the user is actively editing: adopting another tab's write mid-edit would
 * silently discard local, unsaved changes. Such keys opt out with `sync: false`.
 *
 * Used by WP-5 to persist the light/dark theme toggle (see `app.css`).
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: { sync?: boolean } = {},
): [T, (value: T | ((prev: T) => T)) => void] {
  const { sync = true } = options;
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initialValue : (JSON.parse(raw) as T);
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* storage unavailable (private mode, quota, blocked) — keep in-memory value */
        }
        return next;
      });
    },
    [key],
  );

  // Keep multiple tabs in sync (opt-out for actively-edited values).
  useEffect(() => {
    if (!sync) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        setStoredValue(e.newValue === null ? initialValue : (JSON.parse(e.newValue) as T));
      } catch {
        /* ignore malformed cross-tab payloads */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, initialValue, sync]);

  return [storedValue, setValue];
}

export default useLocalStorage;
