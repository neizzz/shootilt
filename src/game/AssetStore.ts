import { Texture } from 'pixi.js';

export type Asset = Texture | Texture[];
export type AssetBundle = Record<string, Asset>;

export default class AssetStore {
  private _store = {} as Record<string, Asset | AssetBundle>;

  constructor() {
    if (window.GameContext.assetStore) {
      throw new Error(`'AssetStore' already exists.`);
    }
    window.GameContext.assetStore = this;
  }

  destroy() {
    /** TODO: */
  }

  // add(key: string, asset: Asset | AssetBundle): ThisType<AssetStore> {
  add(key: string, asset: Asset | AssetBundle): this {
    if (this._store[key]) throw new Error(`the key(${key}) already exists.`);
    this._store[key] = asset;
    return this;
  }

  get(key: string): Asset | AssetBundle {
    return this._store[key];
  }

  remove(key: string) {
    delete this._store[key];
  }

  /** addAudio, removeAudio, ... */
}

