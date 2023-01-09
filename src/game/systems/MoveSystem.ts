import EventDispatcher from '@game/EventDispatcher';

import { GameContext } from '@game';

import { PositionComponent, VelocityComponent } from '@game/models/component';
import { Entity } from '@game/models/entity';
import { GameEvent } from '@game/models/event';
import { ISystem } from '@game/models/system';

import { isOutsideStage } from '@game/utils/game-context';

export default class MoveSystem implements ISystem {
  private _eventDispatcher: EventDispatcher;
  private _positionComponents: PositionComponent[];
  private _velocityComponents: VelocityComponent[];

  constructor(
    eventDispatcher: EventDispatcher,
    positionComponents: PositionComponent[],
    velocityComponents: VelocityComponent[]
  ) {
    this._eventDispatcher = eventDispatcher;
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

      position.x = position.x + velocity.x;
      position.y = position.y + velocity.y;

      if (position.removeIfOutside && isOutsideStage(position.x, position.y)) {
        this._eventDispatcher.dispatchToEntity(entity, GameEvent.OutsideStage);
      }
    }
  }

  private _checkInUse(entity: Entity) {
    return (
      this._velocityComponents[entity].inUse &&
      this._positionComponents[entity].inUse
    );
  }
}

