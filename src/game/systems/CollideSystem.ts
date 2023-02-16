import EventBus from '@game/EventBus';

import { GameContext } from '@game';

import { CollideComponent, PositionComponent } from '@game/models/component';
import { Entity } from '@game/models/entity';
import { ISystem } from '@game/models/system';

import { distance } from '@game/utils/in-game';

export default class CollideSystem implements ISystem {
  private _eventBus: EventBus;
  private _collideComponents: CollideComponent[];
  private _positionComponents: PositionComponent[];

  constructor(
    eventDispatcher: EventBus,
    collideComponents: CollideComponent[],
    positionComponents: PositionComponent[]
  ) {
    this._eventBus = eventDispatcher;
    this._collideComponents = collideComponents;
    this._positionComponents = positionComponents;
  }

  update() {
    for (
      let entity = 0 as Entity;
      entity < GameContext.MAX_ENTITY_COUNT;
      entity++
    ) {
      if (!this._checkInUse(entity)) continue;

      const collide = this._collideComponents[entity];
      const position = this._positionComponents[entity];

      collide.targetEntitiesRef?.current.forEach((targetEntity) => {
        if (!this._checkInUse(targetEntity)) return;

        const targetCollide = this._collideComponents[targetEntity];
        const targetPosition = this._positionComponents[targetEntity];
        const dist = distance(
          {
            x: position.x + collide.distFromCenter.x,
            y: position.y + collide.distFromCenter.y,
          },
          {
            x: targetPosition.x + targetCollide.distFromCenter.x,
            y: targetPosition.y + targetCollide.distFromCenter.y,
          }
        );

        if (dist < collide.radius + targetCollide.radius) {
          this._eventBus.dispatchToEntity(collide.eventToTarget!, targetEntity);
        }
      });
    }
  }

  private _checkInUse(entity: Entity) {
    return (
      this._collideComponents[entity].inUse &&
      this._positionComponents[entity].inUse
    );
  }
}

