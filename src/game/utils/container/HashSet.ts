export default class HashSet<T extends string | number | symbol> {
  private _dirtyFlag = false;
  private _cachedKeysRef = {
    current: [],
  } as CachedKeysRef<T>;
  private _o = {} as Record<T, boolean>;

  add(key: T) {
    this._o[key] = true;
    this._dirtyFlag = true;
  }

  remove(key: T) {
    delete this._o[key];
    this._dirtyFlag = true;
  }

  length() {
    this._updateCache();
    return this._cachedKeysRef.current.length;
  }

  keys(): T[] {
    this._updateCache();
    return this._cachedKeysRef.current;
  }

  keysRef(): CachedKeysRef<T> {
    this._updateCache();
    return this._cachedKeysRef;
  }

  private _updateCache() {
    if (!this._dirtyFlag) return;
    this._cachedKeysRef.current = Object.keys(this._o) as T[];
    console.log(this._cachedKeysRef);
    this._dirtyFlag = false;
  }
}

