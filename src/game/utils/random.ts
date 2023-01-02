import { GameContext } from '..';

// FIXME: 유틸에서 Game의존성이 생기는건 좀 아닌것 같음.

export const randomPosition = (
  maxWidth = GameContext.VIEW_WIDTH,
  maxHeight = GameContext.VIEW_HEIGHT
) => ({
  x: Math.floor(Math.random() * maxWidth),
  y: Math.floor(Math.random() * maxHeight),
});

