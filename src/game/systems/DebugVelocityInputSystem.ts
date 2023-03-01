import * as Ecs from 'bitecs';

import {
  AvoiderTag,
  Entity,
  ISystem,
  PlayerTag,
  VelocityStore,
  VelocityType,
} from '@game/models/ecs';

const DEBUG_VELOCITY_UNIT = 5;

export default class DebugVelocityInputSystem implements ISystem {
  private _queryPlayer = Ecs.defineQuery([PlayerTag]);

  update() {}

  constructor(world: Ecs.IWorld) {
    window.addEventListener('keydown', (e) => {
      e.preventDefault();
      const targets = this._getTargets(world);

      switch (e.code) {
        case 'ArrowLeft':
          this._setVelocity(targets, { x: -DEBUG_VELOCITY_UNIT });
          break;
        case 'ArrowUp':
          this._setVelocity(targets, { y: -DEBUG_VELOCITY_UNIT });
          break;
        case 'ArrowRight':
          this._setVelocity(targets, { x: DEBUG_VELOCITY_UNIT });
          break;
        case 'ArrowDown':
          this._setVelocity(targets, { y: DEBUG_VELOCITY_UNIT });
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      e.preventDefault();
      const targets = this._getTargets(world);

      switch (e.code) {
        case 'ArrowLeft':
        case 'ArrowRight':
          this._setVelocity(targets, { x: 0 });
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          this._setVelocity(targets, { y: 0 });
          break;
      }
    });
  }

  private _getTargets(world: Ecs.IWorld): Entity[] {
    const player = this._queryPlayer(world)[0];
    if (Ecs.hasComponent(world, VelocityStore, player)) {
      return [player, AvoiderTag.bullet[player]] as Entity[];
    } else {
      return [];
    }
  }

  private _setVelocity(entities: Entity[], velocity: Partial<VelocityType>) {
    entities.forEach((entity) => {
      if (velocity.x !== undefined) VelocityStore.x[entity] = velocity.x;
      if (velocity.y !== undefined) VelocityStore.y[entity] = velocity.y;
    });
  }
}

