import {
  ComponentKind,
  PositionComponent,
  SpriteComponent,
  VelocityComponent,
} from './models/component';
import EntityManager from './EntityManager';
import { EntityKind } from './models/entity';
import { SealedArray } from './utils/container';
import { Application, Sprite } from 'pixi.js';
import RenderSystem from './systems/RenderSystem';
import { ISystem } from './models/system';
import MoveSystem from './systems/MoveSystem';
import VelocityInputSystem from './systems/VelocityInputSystem';

// const MAX_AVOIDER_COUNT = 1;
// const MAX_TRACKER_COUNT = MAX_ENTITY_COUNT - MAX_AVOIDER_COUNT;
// TODO: bullet count

export default class Game {
  static readonly MAX_ENTITY_COUNT = 1024;
  static readonly VIEW_WIDTH = window.innerWidth;
  static readonly VIEW_HEIGHT = window.innerHeight;
  private _gameApp: Application;
  private _entityManager: EntityManager;
  private _systems: ISystem[] = [];
  private _systemsForPlayer: ISystem[] = [];

  componentsPool = {
    [ComponentKind.Velocity]: SealedArray.from<VelocityComponent>(
      { length: Game.MAX_ENTITY_COUNT },
      () => ({
        inUse: false,
        x: NaN,
        y: NaN,
      })
    ),
    [ComponentKind.Position]: SealedArray.from<PositionComponent>(
      { length: Game.MAX_ENTITY_COUNT },
      () => ({
        inUse: false,
        x: NaN,
        y: NaN,
      })
    ),
    [ComponentKind.Sprite]: SealedArray.from<SpriteComponent>(
      { length: Game.MAX_ENTITY_COUNT },
      () => ({
        inUse: false,
        sprite: new Sprite(),
        /** state TODO: kind + state 조합으로 sprite 다양화? */
      })
    ),
  };

  private _playerEntity: number = NaN;
  // trackerEntityMap = new Map<number, boolean>();

  constructor() {
    this._gameApp = new Application({
      width: Game.VIEW_WIDTH,
      height: Game.VIEW_HEIGHT,
      backgroundColor: 0xc8b6e2,
      resolution: window.devicePixelRatio,
      autoDensity: true,
    });
    this._entityManager = new EntityManager(this);
  }

  start() {
    document.body.appendChild(this._gameApp.view);

    /** create the player's avoider */
    this._playerEntity = this._entityManager.createEntity(EntityKind.Avoider);

    /** TODO: set system ordering rule */
    this._systems.push(
      new MoveSystem(
        this.componentsPool[ComponentKind.Position],
        this.componentsPool[ComponentKind.Velocity]
      ),
      new RenderSystem(
        this.componentsPool[ComponentKind.Position],
        this.componentsPool[ComponentKind.Sprite]
      )
    );

    this._systemsForPlayer.push(
      new VelocityInputSystem(
        this.componentsPool[ComponentKind.Velocity][this._playerEntity]
      )
    );

    /** Game Loop */
    this._gameApp.ticker.add((/** tickDelta TODO: frame sync */) => {
      this._systems.forEach((system) => system.update());
    });
  }

  end() {
    this._systems.forEach((system) => system.destroy?.());
    this._systems = [];
  }

  addChild(sprite: Sprite) {
    this._gameApp.stage.addChild(sprite);
  }

  removeChild(sprite: Sprite) {
    this._gameApp.stage.removeChild(sprite);
  }

  getRenderer() {
    return this._gameApp.renderer;
  }
}

