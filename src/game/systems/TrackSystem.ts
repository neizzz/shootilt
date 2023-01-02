import { GameContext } from '@game';

import {
  PositionComponent,
  SpeedComponent,
  StateComponent,
} from '@game/models/component';
import { Entity } from '@game/models/entity';

import { TrackerTrackingState } from '@game/states/tracker';

export default class TrackSystem {
  private _targetEntity: Entity;
  private _stateComponents: StateComponent[];
  private _positionComponents: PositionComponent[];
  private _speedComponents: SpeedComponent[];

  constructor(
    targetEntity: Entity,
    stateComponents: StateComponent[],
    positionComponents: PositionComponent[],
    speedComponents: SpeedComponent[]
  ) {
    this._targetEntity = targetEntity;
    this._stateComponents = stateComponents;
    this._positionComponents = positionComponents;
    this._speedComponents = speedComponents;
  }

  update() {
    const targetPosition = this._positionComponents[this._targetEntity];

    for (
      let entity = 0 as Entity;
      entity < GameContext.MAX_ENTITY_COUNT;
      entity++
    ) {
      if (!this._checkInUse(entity)) continue;

      const speed = this._speedComponents[entity].speed;
      const position = this._positionComponents[entity];

      const vectorX = targetPosition.x - position.x;
      const vectorY = targetPosition.y - position.y;
      const totalScala = Math.abs(vectorX) + Math.abs(vectorY);
      const isZeroTotalScala = totalScala < 0.1;

      this._positionComponents[entity].x += isZeroTotalScala
        ? 0
        : (speed * vectorX) / totalScala;
      this._positionComponents[entity].y += isZeroTotalScala
        ? 0
        : (speed * vectorY) / totalScala;
    }
  }

  private _checkInUse(entity: Entity) {
    return (
      this._stateComponents[entity].inUse &&
      this._stateComponents[entity].state instanceof TrackerTrackingState &&
      this._positionComponents[entity].inUse &&
      this._speedComponents[entity].inUse
    );
  }
}

