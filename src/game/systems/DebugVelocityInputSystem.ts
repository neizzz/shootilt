import * as Ecs from 'bitecs';

import {
  Entity,
  EquippedBulletReference,
  ISystem,
  PlayerTag,
  VelocityStore,
  VelocityType,
} from '@game/models/ecs';

const DEBUG_VELOCITY_UNIT = 5;

export default class DebugVelocityInputSystem implements ISystem {
  private _world: Ecs.IWorld;

  private _queryPlayer = Ecs.defineQuery([PlayerTag]);

  private _keyHandlers = {
    keydown: (e: KeyboardEvent) => {
      e.preventDefault();
      const targets = this._getTargets();

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
    },
    keyup: (e: KeyboardEvent) => {
      e.preventDefault();
      const targets = this._getTargets();

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
    },
  };

  constructor(world: Ecs.IWorld) {
    this._world = world;
    window.addEventListener('keydown', this._keyHandlers.keydown);
    window.addEventListener('keyup', this._keyHandlers.keyup);
  }

  destroy() {
    window.removeEventListener('keydown', this._keyHandlers.keydown);
    window.removeEventListener('keyup', this._keyHandlers.keyup);
  }

  update() {}

  private _getTargets(): Entity[] {
    const world = this._world;
    const player = this._queryPlayer(world)[0];
    if (Ecs.hasComponent(world, VelocityStore, player)) {
      return [player, EquippedBulletReference.bullet[player]] as Entity[];
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

