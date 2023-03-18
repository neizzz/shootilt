import * as Ecs from 'bitecs';

import { GameContext } from '@game';

import '@game/models/ecs';
import {
  ChaseStore,
  ISystem,
  PositionStore,
  VelocityStore,
} from '@game/models/ecs';

export default class ChaseSystem implements ISystem {
  private _queryChasers = Ecs.defineQuery([ChaseStore]);

  update(world: Ecs.IWorld, delta: number) {
    const chasingSpeed = GameContext.CURRENT_CHASE_SPEED;
    const epsilon = 0.1;

    this._queryChasers(world).forEach((chaser) => {
      const target = ChaseStore.target[chaser];

      const vectorX = PositionStore.x[target] - PositionStore.x[chaser];
      const vectorY = PositionStore.y[target] - PositionStore.y[chaser];
      const originSpeed =
        delta * Math.sqrt(vectorX * vectorX + vectorY * vectorY);
      const coef =
        originSpeed < epsilon ? 0 : (delta * chasingSpeed) / originSpeed;

      VelocityStore.x[chaser] = vectorX * coef;
      VelocityStore.y[chaser] = vectorY * coef;
    });
  }
}

