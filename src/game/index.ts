import {
  ComponentKind,
  PositionComponent,
  SpriteComponent,
  VelocityComponent,
} from './models/component';
import EntityManager from './EntityManager';
import { EntityKind } from './models/entity';
import { SealedArray } from './utils';
import { Application, Sprite } from 'pixi.js';
import RenderSystem from './systems/RenderSystem';
import { ISystem } from './models/system';

// const MAX_AVOIDER_COUNT = 1;
// const MAX_TRACKER_COUNT = MAX_ENTITY_COUNT - MAX_AVOIDER_COUNT;
// TODO: bullet count

export default class Game {
  static readonly MAX_ENTITY_COUNT = 1024;
  static readonly WIDTH = window.innerWidth;
  static readonly HEIGHT = window.innerHeight;
  private _entityManager: EntityManager;
  private _systems: ISystem[] = [];

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
  avoiderEntityMap = new Map<number, boolean>();
  trackerEntityMap = new Map<number, boolean>();

  constructor() {
    /** TODO: set system ordering rule */
    this._entityManager = new EntityManager(this);
    this._systems.push(
      // new MoveSysmtem(),/
      new RenderSystem(
        this.componentsPool[ComponentKind.Position],
        this.componentsPool[ComponentKind.Sprite]
      )
    );
  }

  start() {
    /** init PIXI.js */
    const app = new Application({
      width: Game.WIDTH,
      height: Game.HEIGHT,
      backgroundColor: 0xc8b6e2,
      // resolution: window.devicePixelRatio ?? 1,
    });
    document.body.appendChild(app.view);

    /** create the player's avoider */
    this._entityManager.createEntity(EntityKind.Avoider);

    /** Game Loop */
    app.ticker.add((/** tickDelta TODO: frame sync */) => {});

    window.addEventListener(
      'deviceorientation',
      this._deviceOrientationListener
    );
  }

  end() {
    window.removeEventListener(
      'deviceorientation',
      this._deviceOrientationListener
    );
  }

  /** TODO:
   * 이벤트 주기 파악.
   */
  private _deviceOrientationListener(e: DeviceOrientationEvent) {}
}

