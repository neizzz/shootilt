import Game from '@game';

import { ComponentKind, MappedComponentFromKind } from '@game/models/component';
import { Entity, EntityKind } from '@game/models/entity';

import { increasingKeys } from '@game/utils/array';
import { CircularQueue, SealedArray } from '@game/utils/container';

import { AvoiderControlledState } from './states/avoider';
import { TrackerSpawningState } from './states/tracker';

export default class EntityManager {
  private _game: Game;
  private _idleEntityQueue = new CircularQueue<Entity>(
    Game.MAX_ENTITY_COUNT + 1
  );
  private _countInfos = Object.seal({
    [EntityKind.NULL]: NaN,
    [EntityKind.Avoider]: 0,
    [EntityKind.Tracker]: 0,
  });
  private _kindInfos = SealedArray.from<EntityKind>({
    length: Game.MAX_ENTITY_COUNT,
  });

  constructor(game: Game) {
    this._game = game;
    increasingKeys(Game.MAX_ENTITY_COUNT).forEach((num) =>
      this._idleEntityQueue.push(num as Entity)
    );
  }

  getEntityCount(kind: EntityKind): number {
    return this._countInfos[kind];
  }

  createEntity(
    kind: EntityKind,
    initComponents?: {
      [key in keyof MappedComponentFromKind]?: Partial<
        MappedComponentFromKind[key]
      >;
    }
  ): Entity {
    const newEntity = this._nextIdleEntity();
    const componentPools = this._game.getComponentPools();

    switch (kind) {
      case EntityKind.Avoider: {
        componentPools[ComponentKind.Position][newEntity].inUse = true;
        componentPools[ComponentKind.Position][newEntity].x =
          Game.VIEW_WIDTH / 2;
        componentPools[ComponentKind.Position][newEntity].y =
          Game.VIEW_HEIGHT / 2;

        componentPools[ComponentKind.Velocity][newEntity].inUse = true;
        componentPools[ComponentKind.Velocity][newEntity].x = 0;
        componentPools[ComponentKind.Velocity][newEntity].y = 0;

        const stateComponent = componentPools[ComponentKind.State][newEntity];
        stateComponent.inUse = true;
        stateComponent.state = new AvoiderControlledState(
          this._game.getGameStage(),
          this._game.getTextureMap(EntityKind.Avoider),
          stateComponent
        ).enter();
        break;
      }

      case EntityKind.Tracker: {
        componentPools[ComponentKind.Position][newEntity].inUse = true;
        componentPools[ComponentKind.Position][newEntity].x =
          initComponents?.[ComponentKind.Position]?.x ?? NaN;
        componentPools[ComponentKind.Position][newEntity].y =
          initComponents?.[ComponentKind.Position]?.y ?? NaN;

        componentPools[ComponentKind.Speed][newEntity].inUse = true;
        componentPools[ComponentKind.Speed][newEntity].speed = 1;

        const stateComponent = componentPools[ComponentKind.State][newEntity];
        stateComponent.inUse = true;
        stateComponent.state = new TrackerSpawningState(
          this._game.getGameStage(),
          this._game.getTextureMap(EntityKind.Tracker),
          stateComponent
        ).enter();
        break;
      }

      default:
        throw new Error('unknown entity kind');
    }

    this._countInfos[kind]++;
    this._kindInfos[newEntity] = kind;
    return newEntity as Entity;
  }

  removeEntity(entity: Entity): void {
    const componentPools = this._game.getComponentPools();

    Object.values(componentPools).forEach((componentPool) => {
      componentPool[entity].inUse = false;
    });

    this._countInfos[this._kindInfos[entity] as EntityKind]--;
    this._kindInfos[entity] = EntityKind.NULL;
    this._returnEntity(entity);
  }

  private _nextIdleEntity(): Entity {
    return this._idleEntityQueue.pop();
  }

  private _returnEntity(entity: Entity): void {
    return this._idleEntityQueue.push(entity);
  }
}

