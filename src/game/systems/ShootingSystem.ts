import ShootingDragManager from '@game/ShootingDragManager';
import * as Ecs from 'bitecs';
import { Container, ISystem } from 'pixi.js';

import { GameContext } from '@game';

import { BulletState, ComponentKind } from '@game/models/constant';
import {
  AvoiderTag,
  BulletTag,
  PlayerTag,
  PositionStore,
  VelocityStore,
  VelocityType,
} from '@game/models/ecs';

import { createBullet } from '@game/utils/create-entity';

export default class ShootingSystem implements ISystem {
  private _shootingDragManager: ShootingDragManager;

  private _queryPlayer = Ecs.defineQuery([PlayerTag]);

  private _shootContext = {
    requested: false,
    velocity: {
      x: NaN,
      y: NaN,
    } as VelocityType,
  };

  constructor(stage: Container) {
    this._shootingDragManager = new ShootingDragManager(
      stage,
      this.shoot.bind(this)
    );
  }

  shoot(velocity: VelocityType) {
    this._shootContext.requested = true;
    this._shootContext.velocity = velocity;
  }

  reload() {}

  destroy() {
    this._shootingDragManager.destroy();
  }

  update(world: Ecs.IWorld) {
    const player = this._queryPlayer(world)[0];

    this._shootingDragManager.updateSightLine({
      x: PositionStore.x[player],
      y: PositionStore.y[player],
    });

    if (this._shootContext.requested) {
      this._shootContext.requested = false;
      const { x, y } = this._shootContext.velocity as VelocityType;

      const bullet = AvoiderTag.bullet[player];
      BulletTag.state[bullet] = BulletState.Shooted;
      VelocityStore.x[bullet] = x;
      VelocityStore.y[bullet] = y;

      AvoiderTag.bullet[player] = createBullet(world, {
        [ComponentKind.Position]: {
          x: PositionStore.x[player],
          y: PositionStore.y[player],
        },
      });
    }
  }
}

