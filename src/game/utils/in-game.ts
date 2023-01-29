import { Graphics } from 'pixi.js';

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
): SimplePoint => ({
  x: Math.floor(Math.random() * maxWidth),
  y: Math.floor(Math.random() * maxHeight),
});

export const isOutsideStage = (x: number, y: number): boolean =>
  x < 0 || y < 0 || x > GameContext.VIEW_WIDTH || y > GameContext.VIEW_HEIGHT;

export const distance = (p1: SimplePoint, p2: SimplePoint): number => {
  return Math.sqrt(
    (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)
  );
};

/** NOTE: height > width */
export const headCircleCenter = (
  width: number,
  height: number,
  rotation: number
): SimplePoint => {
  const centerDist = height / 2 - width / 2;

  return {
    // x: centerDist * Math.cos(Math.PI / 2 - rotation),
    x: centerDist * Math.sin(rotation),
    y: -centerDist * Math.cos(rotation),
  };
};

