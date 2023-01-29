const { Renderer } = require('pixi.js');

window.GameContext = {
  VIEW_WIDTH: window.innerWidth,
  VIEW_HEIGHT: window.innerHeight,
  MAX_ENTITY_COUNT: 1024,
  renderer: Renderer,
};

