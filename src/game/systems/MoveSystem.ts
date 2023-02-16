import EventBus from '@game/EventBus';

import { GameContext } from '@game';

import { PositionComponent, VelocityComponent } from '@game/models/component';
import { Entity } from '@game/models/entity';
import { GameEvent } from '@game/models/event';
import { ISystem } from '@game/models/system';

import { isOutsideStage } from '@game/utils/in-game';

export default class MoveSystem implements ISystem {
  private _eventBus: EventBus;
  private _positionComponents: PositionComponent[];
  private _velocityComponents: VelocityComponent[];

  constructor(
    eventDispatcher: EventBus,
    positionComponents: PositionComponent[],
    velocityComponents: VelocityComponent[]
  ) {
    this._eventBus = eventDispatcher;
    this._positionComponents = positionComponents;
    this._velocityComponents = velocityComponents;
  }

  update(delta: number) {
    for (
      let entity = 0 as Entity;
      entity < GameContext.MAX_ENTITY_COUNT;
      entity++
    ) {
      if (!this._checkInUse(entity)) continue;

      const position = this._positionComponents[entity];
      const velocity = this._velocityComponents[entity];

      position.x = position.x + velocity.vx * delta;
      position.y = position.y + velocity.vy * delta;

      if (position.removeIfOutside && isOutsideStage(position.x, position.y)) {
        this._eventBus.dispatchToEntity(GameEvent.Dead, entity);
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

