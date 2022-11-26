/** TODO: deep-seal */
export class SealedArray {
  static from = <T>({ length }: ArrayLike<T>, mapFn: () => T) =>
    Object.seal(Array.from({ length }, mapFn));
}

