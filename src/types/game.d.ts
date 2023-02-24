import AssetStore from '@game/AssetStore';
import { Renderer } from 'pixi.js';

export {};

declare global {
  interface Window {
    GameContext: {
      VIEW_WIDTH: number;
      VIEW_HEIGHT: number;
      MAX_ENTITY_COUNT: 512;
      renderer?: Renderer;
      assetStore?: AssetStore;
    };
  }

  type SimplePoint = {
    x: number;
    y: number;
  };

  type CachedKeysRef<T> = { current: T[] };
}

