// TODO: deep sealed
export class SealedArray {
  static from<T>({ length }: ArrayLike<T>, mapFn?: () => T): T[] {
    return mapFn
      ? Object.seal(Array.from({ length }, mapFn))
      : Object.seal(Array.from({ length }));
  }
}

