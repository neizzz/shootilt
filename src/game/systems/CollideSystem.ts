import * as Ecs from 'bitecs';

import { EntityKind } from '@game/models/constant';
import {
  AvoiderTag,
  BulletTag,
  ChaserTag,
  CollideStore,
  ISystem,
  PositionStore,
} from '@game/models/ecs';

import { distance } from '@game/utils/math';

export default class CollideSystem implements ISystem {
  private _queryCollisionableEntities = Ecs.defineQuery([CollideStore]);

  /** TODO: 더 나은 방법?? */
  private _queryAvoiders = Ecs.defineQuery([AvoiderTag]);
  private _queryChasers = Ecs.defineQuery([ChaserTag]);
  private _queryBullets = Ecs.defineQuery([BulletTag]);

  /** TODO: FIXME: 이렇게 switch문을 쓰는 방법밖에 없나? */
  update(world: Ecs.IWorld) {
    this._queryCollisionableEntities(world).forEach((collisionable) => {
      const targets = (() => {
        switch (CollideStore.targetKind[collisionable]) {
          case EntityKind.Avoider:
            return this._queryAvoiders(world);
          case EntityKind.Chaser:
            return this._queryChasers(world);
          case EntityKind.Bullet:
            return this._queryBullets(world);
        }
      })();

      if (!targets) return;

      const baseRadius = CollideStore.hitRadius[collisionable];

      targets.forEach((target) => {
        const dist = distance(
          {
            x: PositionStore.x[collisionable],
            y: PositionStore.y[collisionable],
          },
          {
            x: PositionStore.x[target],
            y: PositionStore.y[target],
          }
        );

        if (dist < baseRadius + CollideStore.hitRadius[target]) {
          switch (CollideStore.targetKind[collisionable]) {
            case EntityKind.Avoider:
              AvoiderTag.state[target] =
                CollideStore.hitStateToTarget[collisionable];
              break;
            case EntityKind.Chaser:
              ChaserTag.state[target] =
                CollideStore.hitStateToTarget[collisionable];
              break;
            case EntityKind.Bullet:
              BulletTag.state[target] =
                CollideStore.hitStateToTarget[collisionable];
              break;
          }
        }
      });
    });
  }
}

