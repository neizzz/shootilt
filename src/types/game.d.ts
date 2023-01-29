export {};

declare global {
  type SimplePoint = {
    x: number;
    y: number;
  };

  type CachedKeysRef<T> = { current: T[] };
}

