import gsap from 'gsap';
import {
  Application,
  Container,
  ENV,
  Graphics,
  Texture,
  settings,
} from 'pixi.js';

import {
  ComponentKind,
  PartialComponents,
  PositionComponent,
  SpeedComponent,
  StateComponent,
  VelocityComponent,
} from '@game/models/component';
import { Entity, EntityKind } from '@game/models/entity';
import { ISystem } from '@game/models/system';

import { BulletShootingState } from '@game/states/bullet';

import MoveSystem from '@game/systems/MoveSystem';
import RenderSystem from '@game/systems/RenderSystem';
import ShootingSystem from '@game/systems/ShootingSystem';
import TrackSystem from '@game/systems/TrackSystem';
import TrailEffectSystem from '@game/systems/TrailEffectSystem';
import VelocityInputSystem from '@game/systems/VelocityInputSystem';
import WaveSystem from '@game/systems/WaveSystem';

import { increasingKeys } from '@game/utils/array';
import { SealedArray } from '@game/utils/container';
import { now } from '@game/utils/time';

import EntityManager from './EntityManager';
import EventDispatcher from './EventDispatcher';

settings.PREFER_ENV = ENV.WEBGL2;

export const GameContext = window.GameContext;

export default class Game {
  private _gameApp: Application;
  private _stage: Container;
  private _textureMaps!: Partial<
    Record<EntityKind, Record<string, Texture | Texture[]>>
  >;
  private _eventDispatcher: EventDispatcher;
  private _entityManager: EntityManager;
  private _systems: ISystem[] = [];
  private _timeInfo: {
    start: number;
  } = { start: NaN };

  private _componentPools = {
    [ComponentKind.Velocity]: SealedArray.from<VelocityComponent>(
      { length: GameContext.MAX_ENTITY_COUNT },
      () => ({
        inUse: false,
        x: NaN,
        y: NaN,
      })
    ),
    [ComponentKind.Speed]: SealedArray.from<SpeedComponent>(
      { length: GameContext.MAX_ENTITY_COUNT },
      () => ({
        inUse: false,
        speed: NaN,
      })
    ),
    [ComponentKind.Position]: SealedArray.from<PositionComponent>(
      { length: GameContext.MAX_ENTITY_COUNT },
      () => ({
        inUse: false,
        x: NaN,
        y: NaN,
        removeIfOutside: false,
      })
    ),
    [ComponentKind.State]: SealedArray.from<StateComponent>(
      { length: GameContext.MAX_ENTITY_COUNT },
      () => ({
        inUse: false,
        state: undefined,
        sprites: [],
      })
    ),
  };

  private _playerEntity = NaN as Entity;

  constructor() {
    this._gameApp = new Application({
      width: GameContext.VIEW_WIDTH,
      height: GameContext.VIEW_HEIGHT,
      backgroundColor: 0xc8b6e2,
      resolution: window.devicePixelRatio,
      autoDensity: true,
    });
    this._stage = new Container();
    this._stage.sortableChildren = true;
    this._stage.interactive = true;
    this._stage.hitArea = this._gameApp.screen;
    this._gameApp.stage.addChild(this._stage);
    this._eventDispatcher = new EventDispatcher(
      this._componentPools[ComponentKind.State]
    );
    this._entityManager = new EntityManager(this);
  }

  private async _initTextureMaps() {
    this._textureMaps = {
      [EntityKind.Avoider]: {
        Body: this.generateTexture(
          new Graphics().beginFill(0x495c83).drawCircle(0, 0, 6).endFill()
        ),
      },
      [EntityKind.Tracker]: {
        SpawningBody: increasingKeys(40).map((num) => {
          const currentGraphics = new Graphics();
          currentGraphics.beginFill(0xeb455f);
          currentGraphics.drawCircle(0, 0, 0.15 * num);
          currentGraphics.endFill();
          currentGraphics.cacheAsBitmap = true;
          return this.generateTexture(currentGraphics);
        }),
        Shadow: this.generateTexture(
          new Graphics().beginFill(0xfcffe7).drawCircle(0, 0, 8).endFill()
        ),
      },
      [EntityKind.Bullet]: {
        BasicBody: await Texture.fromURL(`${__ASSET_DIR__}/basic-bullet.png`),
        FireBody: await Texture.fromURL(`${__ASSET_DIR__}/fire-bullet.png`),
        IceBody: await Texture.fromURL(`${__ASSET_DIR__}/ice-bullet.png`),
      },
    };
  }

  async start() {
    // TODO: Loading
    // FIXME: 원래 여기있으면 안됨. 앱이 켜지고 인게임 진입 전에 하도록.
    await this._initTextureMaps();

    document.body.appendChild(this._gameApp.view);

    this._timeInfo = Object.freeze({ start: now() });

    /** create the player's avoider */
    this._playerEntity = this._entityManager.createEntity(EntityKind.Avoider);

    /** update */
    this._systems.push(
      new WaveSystem(
        (positionX: number, positionY: number) =>
          this._entityManager.createEntity(EntityKind.Tracker, {
            [ComponentKind.Position]: { x: positionX, y: positionY },
          }),
        () => this._entityManager.getTrackerCount(),
        this.getStartTime.bind(this)
      ),
      new TrackSystem(
        this._playerEntity,
        this._componentPools[ComponentKind.State],
        this._componentPools[ComponentKind.Position],
        this._componentPools[ComponentKind.Speed]
      ),
      new MoveSystem(
        this._eventDispatcher,
        this._componentPools[ComponentKind.Position],
        this._componentPools[ComponentKind.Velocity]
      ),
      new RenderSystem(
        this._componentPools[ComponentKind.Position],
        this._componentPools[ComponentKind.State]
      ),
      new TrailEffectSystem(
        this._componentPools[ComponentKind.Position][this._playerEntity],
        this._gameApp.stage,
        Texture.from(`${__ASSET_DIR__}/trail.png`)
      )
    );

    new ShootingSystem(
      this.getGameStage(),
      this._componentPools[ComponentKind.Position][this._playerEntity],
      () =>
        new BulletShootingState(
          this.getGameStage(),
          this.getTextureMap(EntityKind.Bullet)
        ),
      (initComponents: PartialComponents) => {
        this._entityManager.createEntity(EntityKind.Bullet, initComponents);
      }
    );
    new VelocityInputSystem(
      this._componentPools[ComponentKind.Velocity][this._playerEntity]
    );

    /** Game Loop */
    this._gameApp.ticker
      .add((delta) => {
        this._systems.forEach((system) => system.update(delta));
      })
      .stop();
    gsap.ticker.add(() => {
      this._gameApp.ticker.update();
    });
  }

  end() {
    this._systems.forEach((system) => system.destroy?.());
    this._systems = [];
  }

  getStartTime(): number {
    return this._timeInfo.start;
  }

  getComponentPools() {
    return this._componentPools;
  }

  getGameStage() {
    return this._stage;
  }

  getTextureMap(kind: EntityKind): Record<string, Texture | Texture[]> {
    const textureMap = this._textureMaps[kind];

    if (textureMap === undefined) {
      throw new Error('not existing texture map');
    } else {
      return textureMap;
    }
  }

  generateTexture(graphics: Graphics): Texture {
    return this._gameApp.renderer.generateTexture(graphics);
  }
}

