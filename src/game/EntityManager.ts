import Game from '@game';
import { ComponentKind, MappedComponentFromKind } from '@game/models/component';
import { Entity, EntityKind } from '@game/models/entity';
import { CircularQueue, SealedArray } from '@game/utils/container';

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
    [...Array(Game.MAX_ENTITY_COUNT).keys()].forEach((num) =>
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
    const componentsPool = this._game.componentsPool;

    switch (kind) {
      case EntityKind.Avoider: {
        componentsPool[ComponentKind.Appearance][newEntity].inUse = true;
        componentsPool[ComponentKind.Appearance][newEntity].kind = kind;

        componentsPool[ComponentKind.Position][newEntity].inUse = true;
        componentsPool[ComponentKind.Position][newEntity].x =
          Game.VIEW_WIDTH / 2;
        componentsPool[ComponentKind.Position][newEntity].y =
          Game.VIEW_HEIGHT / 2;

        componentsPool[ComponentKind.Velocity][newEntity].inUse = true;
        componentsPool[ComponentKind.Velocity][newEntity].x = 0;
        componentsPool[ComponentKind.Velocity][newEntity].y = 0;
        break;
      }

      case EntityKind.Tracker: {
        componentsPool[ComponentKind.Appearance][newEntity].inUse = true;
        componentsPool[ComponentKind.Appearance][newEntity].kind = kind;

        componentsPool[ComponentKind.Position][newEntity].inUse = true;
        componentsPool[ComponentKind.Position][newEntity].x =
          initComponents?.[ComponentKind.Position]?.x ?? NaN;
        componentsPool[ComponentKind.Position][newEntity].y =
          initComponents?.[ComponentKind.Position]?.y ?? NaN;

        componentsPool[ComponentKind.Speed][newEntity].inUse = true;
        componentsPool[ComponentKind.Speed][newEntity].speed = 1;
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
    const componentsPool = this._game.componentsPool;

    Object.values(componentsPool).forEach((componentPool) => {
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

