import EventDispatcher from '@game/EventDispatcher';

import { GameContext } from '@game';

import {
  CollideComponent,
  PositionComponent,
  VelocityComponent,
} from '@game/models/component';
import { Entity } from '@game/models/entity';
import { GameEvent } from '@game/models/event';
import { ISystem } from '@game/models/system';

import { isOutsideStage } from '@game/utils/in-game';

export default class MoveSystem implements ISystem {
  private _eventDispatcher: EventDispatcher;
  private _positionComponents: PositionComponent[];
  private _velocityComponents: VelocityComponent[];
  private _collideComponents: CollideComponent[];

  constructor(
    eventDispatcher: EventDispatcher,
    positionComponents: PositionComponent[],
    velocityComponents: VelocityComponent[],
    collideComponents: CollideComponent[]
  ) {
    this._eventDispatcher = eventDispatcher;
    this._positionComponents = positionComponents;
    this._velocityComponents = velocityComponents;
    this._collideComponents = collideComponents;
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

      position.x = position.x + velocity.vx;
      position.y = position.y + velocity.vy;

      if (position.removeIfOutside && isOutsideStage(position.x, position.y)) {
        this._eventDispatcher.dispatch(GameEvent.OutsideStage, entity);
      }

      // const collide = this._collideComponents[entity];

      // if (collide) {
      //   collide.center.x = collide.center.x + velocity.vx;
      //   collide.center.y = collide.center.y + velocity.vy;
      // }
    }
  }

  private _checkInUse(entity: Entity) {
    return (
      this._velocityComponents[entity].inUse &&
      this._positionComponents[entity].inUse
    );
  }
}

