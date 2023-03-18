import AssetStore from '@game/AssetStore';
import EventBus from '@game/EventBus';
import { Renderer } from 'pixi.js';

export {};

declare global {
  interface Window {
    GameContext: {
      VIEW_WIDTH: number;
      VIEW_HEIGHT: number;
      CURRENT_CHASE_SPEED: number;
      renderer?: Renderer;
    };
  }

  type Key = string | number | symbol;
}

