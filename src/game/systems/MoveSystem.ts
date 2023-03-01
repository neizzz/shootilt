import * as Ecs from 'bitecs';

import { OutsideStageBehavior } from '@game/models/constant';
import { ISystem, PositionStore, VelocityStore } from '@game/models/ecs';
import { OutsideStageBehaviorStore } from '@game/models/ecs';

import { clampIntoStage, isOutsideStage } from '@game/utils/in-game';

export default class MoveSystem implements ISystem {
  private _queryMovables = Ecs.defineQuery([VelocityStore]);

  update(world: Ecs.IWorld, delta: number) {
    this._queryMovables(world).forEach((movable) => {
      let [newX, newY] = [
        PositionStore.x[movable] + VelocityStore.x[movable] * delta,
        PositionStore.y[movable] + VelocityStore.y[movable] * delta,
      ];

      if (isOutsideStage(newX, newY)) {
        switch (OutsideStageBehaviorStore.behavior[movable]) {
          case OutsideStageBehavior.Block:
            const clampedPosition = clampIntoStage(newX, newY);
            [newX, newY] = [clampedPosition.x, clampedPosition.y];
            break;

          case OutsideStageBehavior.Remove:
            Ecs.removeEntity(world, movable);
            break;
        }
      }

      PositionStore.x[movable] = newX;
      PositionStore.y[movable] = newY;
    });
  }
}

