import { Renderer } from '/node_modules/.vite/deps/pixi__js.js?v=016cce63';

window.GameContext = {
  VIEW_WIDTH: window.innerWidth,
  VIEW_HEIGHT: window.innerHeight,
  MAX_ENTITY_COUNT: 1024,
  renderer: Renderer,
};

