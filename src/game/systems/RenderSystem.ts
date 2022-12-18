import { Sprite } from 'pixi.js';

import Game from '@game';
import { IComponent, PositionComponent } from '@game/models/component';
import { Entity } from '@game/models/entity';
import { ISystem } from '@game/models/system';

export type SpriteComponent = IComponent & {
  sprite: Sprite /** FIXME: pixi js로부터 격리 필요 */;
};

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
    for (let entity = 0 as Entity; entity < Game.MAX_ENTITY_COUNT; entity++) {
      if (!this._checkInUse(entity)) continue;

      const { x, y } = this._positionComponents[entity];
      const { sprite } = this._spriteComponents[entity];

      sprite.x = x;
      sprite.y = y;
    }
  }

  private _checkInUse(entity: Entity) {
    return (
      this._spriteComponents[entity].inUse &&
      this._positionComponents[entity].inUse
    );
  }
}
