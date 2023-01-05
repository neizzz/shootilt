import { GameContext } from '@game';

import { PositionComponent, StateComponent } from '@game/models/component';
import { Entity } from '@game/models/entity';
import { ISystem } from '@game/models/system';

export default class RenderSystem implements ISystem {
  private _positionComponents: PositionComponent[];
  private _stateComponents: StateComponent[];

  constructor(
    positionComponents: PositionComponent[],
    stateComponents: StateComponent[]
  ) {
    this._positionComponents = positionComponents;
    this._stateComponents = stateComponents;
  }

  update() {
    for (
      let entity = 0 as Entity;
      entity < GameContext.MAX_ENTITY_COUNT;
      entity++
    ) {
      if (!this._checkInUse(entity)) {
        continue;
      }

      const { sprites, rotation } = this._stateComponents[entity];
      const { x, y } = this._positionComponents[entity];

      sprites.forEach((sprite) => {
        sprite.x = x;
        sprite.y = y;
        sprite.rotation = rotation ?? 0;
      });
    }
  }

  private _checkInUse(entity: Entity) {
    return (
      this._stateComponents[entity].inUse &&
      this._positionComponents[entity].inUse
    );
  }
}

