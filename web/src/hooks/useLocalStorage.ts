import { useCallback, useSyncExternalStore } from 'react';

function getLocalStorage<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw) as T;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return undefined;
}

const listeners = new Map<string, Array<() => void>>();

export default function useLocalStorage<T>(
  key: string,
): [T | undefined, (val: T | undefined) => void] {
  const localStorageKey = `Wol.${key}`;

  const state = useSyncExternalStore(
    (onStoreChange) => {
      const keyListeners = listeners.get(key) ?? [];
      keyListeners.push(onStoreChange);
      listeners.set(key, keyListeners);
      return () => {
        const newKeyListeners = listeners.get(key) ?? [];
        listeners.set(
          key,
          newKeyListeners.filter((item) => item !== onStoreChange),
        );
      };
    },
    () => getLocalStorage<T>(localStorageKey),
  );

  const setLocalStorage = useCallback(
    (value: T | undefined) => {
      if (value === undefined) {
        localStorage.removeItem(localStorageKey);
      } else {
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(value));
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err);
        }
      }
      listeners.get(key)?.forEach((item) => item());
    },
    [localStorageKey, key],
  );

  return [state, setLocalStorage];
}
