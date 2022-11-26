import { EntityKind } from './models/entity';
import { ComponentKind } from './models/component';
import { CircularQueue } from './utils/container';
import Game from '.';

/** NOTE: FIXME: tightly-coupled to PIXI.js */
import { Graphics, RenderTexture, Sprite } from 'pixi.js';

export default class EntityManager {
  private _game: Game;
  private _idleEntityQueue = new CircularQueue<number>(
    Game.MAX_ENTITY_COUNT + 1
  );
  private _createSprite;

  constructor(game: Game) {
    this._game = game;
    this._createSprite = this._createSpriteCloser();
    [...Array(Game.MAX_ENTITY_COUNT).keys()].forEach((num) =>
      this._idleEntityQueue.push(num)
    );
  }

  createEntity(kind: EntityKind, ...args: unknown[]): number {
    const newEntity = this._nextIdleEntity();
    const componentsPool = this._game.componentsPool;

    const sprite = this._createSprite();
    this._game.addChild(sprite);

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

      default:
        throw new Error('unknown entity kind');
    }

    return newEntity;
  }

  removeEntity(entity: number) {
    const componentsPool = this._game.componentsPool;

    {
      const spriteComponent = componentsPool[ComponentKind.Sprite][entity];
      if (spriteComponent.inUse) {
        this._game.removeChild(spriteComponent.sprite);
      }
    }

    Object.values(componentsPool).forEach((componentPool) => {
      componentPool[entity].inUse = false;
    });

    this._returnEntity(entity);
  }

  private _nextIdleEntity() {
    return this._idleEntityQueue.pop();
  }

  private _returnEntity(entity: number) {
    return this._idleEntityQueue.push(entity);
  }

  /** FIXME: 분리할 수 있는 방법 고안 */
  private _createSpriteCloser() {
    const avoiderGraphics = new Graphics();
    avoiderGraphics.beginFill(0x495c83);
    avoiderGraphics.drawCircle(0, 0, 6);
    avoiderGraphics.endFill();
    avoiderGraphics.cacheAsBitmap = true;

    const renderTexture = RenderTexture.create({
      width: avoiderGraphics.width,
      height: avoiderGraphics.height,
    });

    return (/** TODO: entityKind */) => {
      const sprite = new Sprite(renderTexture);
      sprite.addChild(avoiderGraphics);
      sprite.anchor.set(0.5);
      return sprite;
    };
  }
}

