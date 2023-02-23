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

export const clampIntoStage = (x: number, y: number): SimplePoint => {
  x = Math.max(0, x);
  x = Math.min(GameContext.VIEW_WIDTH, x);
  y = Math.max(0, y);
  y = Math.min(GameContext.VIEW_HEIGHT, y);
  return { x, y };
};

export const distance = (p1: SimplePoint, p2: SimplePoint): number => {
  return Math.sqrt(
    (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)
  );
};

/** calculate theta(radian) based on y-axis */
export const theta = (base: SimplePoint, target: SimplePoint): number => {
  const diffX = target.x - base.x;
  const diffY = target.y - base.y;
  let theta: number;

  if (diffX === 0) {
    theta = diffY < 0 ? 0 : Math.PI;
  } else {
    theta = Math.atan(diffY / diffX);
  }

  if (diffX > 0) {
    theta += Math.PI / 2;
  } else if (diffX < 0) {
    theta += Math.PI + Math.PI / 2;
  }
  return theta;
};

/** NOTE: height > width */
export const headCircleCenter = (
  width: number,
  height: number,
  rotation: number
): SimplePoint => {
  const centerDist = height / 2 - width / 2;

  return {
    x: centerDist * Math.sin(rotation),
    y: -centerDist * Math.cos(rotation),
  };
};

