import { AnimatedSprite, Graphics, Sprite, Texture } from 'pixi.js';

import { PositionType } from '@game/models/ecs';

import { GameContext } from '..';

export const generateTexture = (graphics: Graphics) => {
  if (!GameContext.renderer) {
    throw new Error('renderer is not initailized');
  }
  return GameContext.renderer.generateTexture(graphics);
};

export const randomPosition = (
  maxWidth = GameContext.VIEW_WIDTH,
  maxHeight = GameContext.VIEW_HEIGHT
): PositionType => ({
  x: Math.floor(Math.random() * maxWidth),
  y: Math.floor(Math.random() * maxHeight),
});

export const createSprite = (texture: Texture) => {
  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5);
  return sprite;
};

export const createAnimatedSprite = (
  textures: Texture[],
  onComplete?: () => void
) => {
  const animatedSprite = new AnimatedSprite(textures);
  animatedSprite.play();
  animatedSprite.loop = false;
  animatedSprite.anchor.set(0.5);
  animatedSprite.onComplete = onComplete;
  return animatedSprite;
};

export const isAnimationTexture = (
  texture: Texture | Texture[]
): texture is Texture[] => {
  return texture.hasOwnProperty('length');
};

export const isOutsideStage = (x: number, y: number): boolean =>
  x < 0 || y < 0 || x > GameContext.VIEW_WIDTH || y > GameContext.VIEW_HEIGHT;

export const clampIntoStage = (x: number, y: number): PositionType => {
  x = Math.max(0, x);
  x = Math.min(GameContext.VIEW_WIDTH, x);
  y = Math.max(0, y);
  y = Math.min(GameContext.VIEW_HEIGHT, y);
  return { x, y };
};

/** 사분면 기준으로 반대 사분면의 좌표를 반환 */
export const oppositePositionFrom = (
  base: PositionType,
  locationDelta: PositionType
): PositionType => {
  if (locationDelta.x < 0 || locationDelta.y < 0) {
    /** NOTE: 'locationDelta' must be positive value */
    throw new Error('invalid arguments.');
  }

  return {
    x: base.x + (base.x > 0 ? -1 : 1) * locationDelta.x,
    y: base.y + (base.y > 0 ? -1 : 1) * locationDelta.y,
  };
};

