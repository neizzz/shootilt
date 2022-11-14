import {EntityKind} from './models/entity';
import {ComponentKind} from './models/component';
import {CircularQueue} from './utils';
import Game from '.';

/** NOTE: FIXME: tightly-coupled to PIXI.js */
import { autoDetectRenderer, Graphics, Sprite } from 'pixi.js';
/** avoider texture */
const AVOIDER_TEXTURE = (() => {
  const avoiderGraphics = new Graphics();
  avoiderGraphics.beginFill(0x495C83);
  avoiderGraphics.drawCircle(0, 0, 10);
  avoiderGraphics.endFill();
  avoiderGraphics.cacheAsBitmap = true;
  const renderer = autoDetectRenderer();
  return renderer.generateTexture(avoiderGraphics);
})();

export default class EntityManager {
  private _game: Game;
  private _idleEntityQueue = new CircularQueue<number>(Game.MAX_ENTITY_COUNT + 1);

  constructor (game: Game) {
    this._game = game;
    [...Array(Game.MAX_ENTITY_COUNT).keys()].forEach(num => this._idleEntityQueue.push(num));
  }

  createEntity(kind: EntityKind, ...args: unknown[]) {
    const newEntity = this._nextIdleEntity();
    const componentsPool = this._game.componentsPool;

    switch (kind) {
      case EntityKind.Avoider: {
        // componentsPool[ComponentKind.Velocity][newEntity].inUse = true;
        componentsPool[ComponentKind.Position][newEntity].inUse = true;
        componentsPool[ComponentKind.Sprite][newEntity].inUse = true;
        componentsPool[ComponentKind.Sprite][newEntity].sprite = this._createSprite();
        break;
      }
    }
  }

  removeEntity(entity: number) {
    const componentsPool = this._game.componentsPool;
    Object.values(componentsPool).forEach(componentPool => {
      componentPool[entity].inUse = false;
    })
    this._returnEntity(entity);
  }

  private _nextIdleEntity() {
    return this._idleEntityQueue.pop();
  }

  private _returnEntity(entity: number) {
    return this._idleEntityQueue.push(entity);
  }

  /** FIXME: 분리할 수 있는 방법 고안 */
  private _createSprite(/** TODO: sprite kind */) {
    const sprite = new Sprite(AVOIDER_TEXTURE);
    sprite.anchor.set(0.5);
    return sprite;
  }
}
