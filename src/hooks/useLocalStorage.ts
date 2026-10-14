import { useCallback, useEffect, useState } from 'react';

/**
 * Persist a piece of React state in localStorage.
 *
 * - Reads the initial value from storage on mount (falling back to `initialValue`).
 * - Writes back on every change.
 * - Tolerates private-mode / blocked storage: every access is wrapped in try/catch,
 *   so the hook degrades to plain in-memory state instead of throwing.
 * - Syncs across tabs via the `storage` event.
 *
 * Used by WP-5 to persist the light/dark theme toggle (see `app.css`).
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
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

  // Keep multiple tabs in sync.
  useEffect(() => {
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
  }, [key, initialValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;
