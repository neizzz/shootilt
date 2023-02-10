import { GameContext } from '@game';

import {
  PositionComponent,
  StateComponent,
  VelocityComponent,
} from '@game/models/component';
import { Entity } from '@game/models/entity';
import { GameEvent } from '@game/models/event';
import { ISystem } from '@game/models/system';

import { TrackerTrackingState } from '@game/states/tracker';

import { CollideComponent } from './../models/component';

const TRACKING_SPEED = 2;
const EPSILON = 0.1;

export default class TrackSystem implements ISystem {
  private _targetEntity: Entity;
  private _stateComponents: StateComponent[];
  private _positionComponents: PositionComponent[];
  private _velocityComponents: VelocityComponent[];
  private _collideComponents: CollideComponent[];

  constructor(
    targetEntity: Entity,
    stateComponents: StateComponent[],
    positionComponents: PositionComponent[],
    velocityComponents: VelocityComponent[],
    collideComponents: CollideComponent[]
  ) {
    this._targetEntity = targetEntity;
    this._stateComponents = stateComponents;
    this._positionComponents = positionComponents;
    this._velocityComponents = velocityComponents;
    this._collideComponents = collideComponents;
  }

  update(delta: number) {
    const trackingSpeed = TRACKING_SPEED;
    const epsilon = EPSILON;
    const targetPosition = this._positionComponents[this._targetEntity];

    for (
      let entity = 0 as Entity;
      entity < GameContext.MAX_ENTITY_COUNT;
      entity++
    ) {
      if (!this._checkInUse(entity)) continue;

      const velocity = this._velocityComponents[entity];
      const position = this._positionComponents[entity];

      const vectorX = targetPosition.x - position.x;
      const vectorY = targetPosition.y - position.y;
      const originSpeed = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
      const coef =
        originSpeed < epsilon ? 0 : (delta * trackingSpeed) / originSpeed;

      velocity.vx = vectorX * coef;
      velocity.vy = vectorY * coef;

      /** init collide component */
      const collide = this._collideComponents[entity];
      if (!collide.inUse) {
        const state = this._stateComponents[entity];
        collide.inUse = true;
        collide.distFromCenter = { x: 0, y: 0 };
        collide.radius = state.sprites[0].getBounds().width / 2;
        collide.eventToTarget = GameEvent.Dead;
        collide.targetEntitiesRef = { current: [this._targetEntity] };
      }
    }
  }

  private _checkInUse(entity: Entity) {
    return (
      this._stateComponents[entity].inUse &&
      this._stateComponents[entity].state instanceof TrackerTrackingState
      // this._positionComponents[entity].inUse &&
      // this._velocityComponents[entity].inUse
    );
  }
}

