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
    for (let entity = 0; entity < Game.MAX_ENTITY_COUNT; entity++) {
      if (!this._checkInUse(entity)) continue;

      const { x, y } = this._positionComponents[entity];
      const { sprite } = this._spriteComponents[entity];

      sprite.x = x;
      sprite.y = y;
    }
  }

  private _checkInUse(entity: number) {
    return (
      this._spriteComponents[entity].inUse &&
      this._positionComponents[entity].inUse
    );
  }
}

