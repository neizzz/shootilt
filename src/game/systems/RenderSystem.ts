import Game from '..';
import { PositionComponent, SpriteComponent } from '../models/component';
import { ISystem } from '../models/system';

export default class RenderSystem implements ISystem {
  private _positionComponents: PositionComponent[];
  private _spriteComponents: SpriteComponent[];

  constructor(
    positionComponents: PositionComponent[],
    spriteComponents: SpriteComponent[]
  ) {
    this._positionComponents = positionComponents;
    this._spriteComponents = spriteComponents;
  }

  update() {
    for (let i = 0; i < Game.MAX_ENTITY_COUNT; i++) {
      const {x, y} = this._positionComponents[i];
      const {sprite} = this._spriteComponents[i];

      sprite.position.x = x;
      sprite.position.y = y;
    }
  }
}
