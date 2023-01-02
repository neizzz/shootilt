import { GameContext } from '@game';

import { PositionComponent, VelocityComponent } from '@game/models/component';
import { Entity } from '@game/models/entity';
import { ISystem } from '@game/models/system';

export default class MoveSystem implements ISystem {
  private _positionComponents: PositionComponent[];
  private _velocityComponents: VelocityComponent[];

  constructor(
    positionComponents: PositionComponent[],
    velocityComponents: VelocityComponent[]
  ) {
    this._positionComponents = positionComponents;
    this._velocityComponents = velocityComponents;
  }

  update() {
    for (
      let entity = 0 as Entity;
      entity < GameContext.MAX_ENTITY_COUNT;
      entity++
    ) {
      if (!this._checkInUse(entity)) continue;

      const position = this._positionComponents[entity];
      const velocity = this._velocityComponents[entity];

      position.x = Math.max(0, position.x + velocity.x);
      position.x = Math.min(GameContext.VIEW_WIDTH, position.x + velocity.x);
      position.y = Math.max(0, position.y + velocity.y);
      position.y = Math.min(GameContext.VIEW_HEIGHT, position.y + velocity.y);
    }
  }

  private _checkInUse(entity: Entity) {
    return (
      this._velocityComponents[entity].inUse &&
      this._positionComponents[entity].inUse
    );
  }
}

