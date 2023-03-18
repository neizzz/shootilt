import { AnimatedSprite, Graphics, Sprite, Texture } from 'pixi.js';

import { MAX_CHASER_SPEED, MIN_CHASER_SPEED } from '@game/models/constant';
import { PositionType } from '@game/models/ecs';

import { GameContext } from '..';
import { quadrant, rangedRandomInteger, rangedRandomNumber } from './math';

/** NOTE:
 * these functions must be called after game start.
 * (e.g. after GameContext initialized.)
 */

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

export const centerPosition = (): PositionType => {
  return {
    x: GameContext.VIEW_WIDTH / 2,
    y: GameContext.VIEW_HEIGHT / 2,
  };
};

/** FIXME: 없어도 될듯 */
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

export const clampChaserSpeed = (speed: number) => {
  return Math.min(Math.max(MIN_CHASER_SPEED, speed), MAX_CHASER_SPEED);
};

/** 'base' 사분면이 아닌 사분면 쪽(랜덤)으로 'locationDelta'만큼 떨어진 좌표 */
export const oppositePositionFrom = (
  base: PositionType,
  locationDelta: PositionType
): PositionType => {
  if (locationDelta.x < 0 || locationDelta.y < 0) {
    /** NOTE: 'locationDelta' must be positive value */
    throw new Error('invalid arguments.');
  }

  const center = centerPosition();
  const baseQuadrant = quadrant({ x: base.x - center.x, y: base.y - center.y });
  const candidateProductSigns = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, 1],
  ];
  candidateProductSigns.splice(baseQuadrant, 1);
  const pickedProductSigns = candidateProductSigns[rangedRandomInteger(0, 2)];

  return {
    x: base.x + pickedProductSigns[0] * locationDelta.x,
    y: base.y + pickedProductSigns[1] * locationDelta.y,
  };
};

