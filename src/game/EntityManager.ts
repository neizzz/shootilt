/** NOTE: FIXME: tightly-coupled to PIXI.js */
import { Graphics, Sprite } from 'pixi.js';

import Game from '.';
import { ComponentKind, MappedComponentFromKind } from './models/component';
import { Entity, EntityKind } from './models/entity';
import { CircularQueue, SealedArray } from './utils/container';

export default class EntityManager {
  private _game: Game;
  private _idleEntityQueue = new CircularQueue<Entity>(
    Game.MAX_ENTITY_COUNT + 1
  );
  private _countInfos = Object.seal({
    [EntityKind.Avoider]: 0,
    [EntityKind.Tracker]: 0,
  });
  private _kindInfos = SealedArray.from<EntityKind | undefined>({
    length: Game.MAX_ENTITY_COUNT,
  });

  // FIXME: 이건 RenderSystem에 있는게 맞는듯
  private _createSprite: ReturnType<
    InstanceType<typeof EntityManager>['_createSpriteCloser']
  >;

  constructor(game: Game) {
    this._game = game;
    this._createSprite = this._createSpriteCloser();
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

    const sprite = this._createSprite(kind);
    this._game.addChild(sprite); // FIXME: 이건 RenderSystem에 있는게 맞는듯

    switch (kind) {
      case EntityKind.Avoider: {
        componentsPool[ComponentKind.Sprite][newEntity].inUse = true;
        componentsPool[ComponentKind.Sprite][newEntity].sprite = sprite;

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
        componentsPool[ComponentKind.Sprite][newEntity].inUse = true;
        componentsPool[ComponentKind.Sprite][newEntity].sprite = sprite;

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

    // FIXME: 이건 RenderSystem에 있는게 맞는듯
    {
      const spriteComponent = componentsPool[ComponentKind.Sprite][entity];
      if (spriteComponent.inUse) {
        this._game.removeChild(spriteComponent.sprite);
      }
    }

    Object.values(componentsPool).forEach((componentPool) => {
      componentPool[entity].inUse = false;
    });

    this._countInfos[this._kindInfos[entity] as EntityKind]--;
    this._kindInfos[entity] = undefined;
    this._returnEntity(entity);
  }

  private _nextIdleEntity(): Entity {
    return this._idleEntityQueue.pop();
  }

  private _returnEntity(entity: Entity): void {
    return this._idleEntityQueue.push(entity);
  }

  /** FIXME: 분리할 수 있는 방법 고안 */
  private _createSpriteCloser() {
    const avoiderGraphics = new Graphics();
    avoiderGraphics.beginFill(0x495c83);
    avoiderGraphics.drawCircle(0, 0, 6);
    avoiderGraphics.endFill();
    avoiderGraphics.cacheAsBitmap = true;

    const trackerGraphics = new Graphics();
    trackerGraphics.beginFill(0xeb455f);
    trackerGraphics.drawCircle(0, 0, 8);
    trackerGraphics.endFill();
    trackerGraphics.cacheAsBitmap = true;

    return (entityKind: EntityKind) => {
      let graphics;

      switch (entityKind) {
        case EntityKind.Avoider: {
          graphics = avoiderGraphics;
          break;
        }

        case EntityKind.Tracker: {
          graphics = trackerGraphics;
          break;
        }
      }

      const sprite = new Sprite(
        this._game.getRenderer().generateTexture(graphics)
      );
      sprite.anchor.set(0.5);
      return sprite;
    };
  }
}
