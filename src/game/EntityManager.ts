import Game, { GameContext } from '@game';

import { ComponentKind, PartialComponents } from '@game/models/component';
import { Entity, EntityKind } from '@game/models/entity';
import { GameEvent } from '@game/models/event';

import { AvoiderControlledState } from '@game/states/avoider';
import { BulletShootingState } from '@game/states/bullet';
import { TrackerTrackingState } from '@game/states/tracker';
import { TrackerSpawningState } from '@game/states/tracker';

import { increasingKeys } from '@game/utils/array';
import { CircularQueue } from '@game/utils/container';
import { headCircleCenter } from '@game/utils/in-game';

import HashSet from './utils/container/HashSet';

export default class EntityManager {
  private _game: Game;
  private _playerEntity!: Entity;
  private _idleEntityQueue = new CircularQueue<Entity>(
    GameContext.MAX_ENTITY_COUNT + 1
  );

  private _enemyEntitySet = new HashSet<Entity>();

  constructor(game: Game) {
    this._game = game;
    increasingKeys(GameContext.MAX_ENTITY_COUNT).forEach((num) =>
      this._idleEntityQueue.push(num as Entity)
    );
  }

  setPlayerEntity(playerEntity: Entity): void {
    this._playerEntity = playerEntity;
  }

  getPlayerEntity(): Entity {
    return this._playerEntity;
  }

  /** FIXME: 대전에서는 enemy === tracker가 아님 */
  getTrackerCount(): number {
    return this._enemyEntitySet.length();
  }

  /** entity 생성 시점에서 필요한 컴포넌트들 초기화 */
  createEntity(kind: EntityKind, initComponents?: PartialComponents): Entity {
    const newEntity = this._nextIdleEntity();
    const componentPools = this._game.getComponentPools();

    switch (kind) {
      case EntityKind.Avoider: {
        const positionComponent =
          componentPools[ComponentKind.Position][newEntity];
        positionComponent.inUse = true;
        positionComponent.x = GameContext.VIEW_WIDTH / 2;
        positionComponent.y = GameContext.VIEW_HEIGHT / 2;
        positionComponent.removeIfOutside = false;

        const velocityComponent =
          componentPools[ComponentKind.Velocity][newEntity];
        velocityComponent.inUse = true;
        velocityComponent.vx = 0;
        velocityComponent.vy = 0;

        const stateComponent = componentPools[ComponentKind.State][newEntity];
        stateComponent.inUse = true;
        stateComponent.state = new AvoiderControlledState(
          newEntity,
          componentPools,
          this._game.getGameStage(),
          this._game.getTextureMap(EntityKind.Avoider)
        ).enter();

        const { width } = stateComponent.sprites[0].getBounds();
        const collideComponent =
          componentPools[ComponentKind.Collide][newEntity];
        collideComponent.inUse = true;
        collideComponent.distFromCenter = {
          x: 0,
          y: 0,
        };
        collideComponent.radius = width / 2;
        break;
      }

      case EntityKind.Tracker: {
        const positionComponent =
          componentPools[ComponentKind.Position][newEntity];
        positionComponent.inUse = true;
        positionComponent.x = initComponents![ComponentKind.Position]!.x!;
        positionComponent.y = initComponents![ComponentKind.Position]!.y!;
        positionComponent.removeIfOutside = false;

        const velocityComponent =
          componentPools[ComponentKind.Velocity][newEntity];
        velocityComponent.inUse = true;
        velocityComponent.vx = 0;
        velocityComponent.vy = 0;

        const stateComponent = componentPools[ComponentKind.State][newEntity];
        stateComponent.inUse = true;
        stateComponent.state = new TrackerSpawningState(
          newEntity,
          this._game.getComponentPools(),
          this._game.getGameStage(),
          this._game.getTextureMap(EntityKind.Tracker)
        ).enter();
        break;
      }

      case EntityKind.Bullet: {
        const positionComponent =
          componentPools[ComponentKind.Position][newEntity];
        positionComponent.inUse = true;
        positionComponent.x = initComponents![ComponentKind.Position]!.x!;
        positionComponent.y = initComponents![ComponentKind.Position]!.y!;
        positionComponent.removeIfOutside = true;

        const velocityComponent =
          componentPools[ComponentKind.Velocity][newEntity];
        velocityComponent.inUse = true;
        velocityComponent.vx = initComponents![ComponentKind.Velocity]!.vx!;
        velocityComponent.vy = initComponents![ComponentKind.Velocity]!.vy!;

        const stateComponent = componentPools[ComponentKind.State][newEntity];
        stateComponent.inUse = true;
        stateComponent.rotation =
          initComponents![ComponentKind.State]!.rotation!;
        stateComponent.state = new BulletShootingState(
          newEntity,
          this._game.getComponentPools(),
          this._game.getGameStage(),
          this._game.getTextureMap(EntityKind.Bullet)
        ).enter();

        const { width, height } = stateComponent.sprites[0].getBounds();
        const collideComponent =
          componentPools[ComponentKind.Collide][newEntity];
        collideComponent.inUse = true;
        collideComponent.distFromCenter = headCircleCenter(
          width,
          height,
          stateComponent.rotation
        );
        collideComponent.radius = width / 2;
        collideComponent.targetEntitiesRef = this._enemyEntitySet.keysRef();
        collideComponent.eventToTarget = GameEvent.Dead;
        break;
      }

      default:
        throw new Error('unknown entity kind');
    }

    /** FIXME: */
    if (kind === EntityKind.Tracker) {
      this._enemyEntitySet.add(newEntity);
    }
    return newEntity as Entity;
  }

  removeEntity(entity: Entity): void {
    const componentPools = this._game.getComponentPools();

    Object.values(componentPools).forEach((componentPool) => {
      componentPool[entity].inUse = false;
    });

    const stateComponent = componentPools[ComponentKind.State][entity];

    /** FIXME: */
    if (stateComponent.state instanceof TrackerTrackingState) {
      this._enemyEntitySet.remove(entity);
    }

    stateComponent.state?.destroy();
    stateComponent.state = undefined;
    this._returnEntity(entity);
  }

  private _nextIdleEntity(): Entity {
    return this._idleEntityQueue.pop();
  }

  private _returnEntity(entity: Entity): void {
    return this._idleEntityQueue.push(entity);
  }
}

