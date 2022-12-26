import EntityManager from '@game/EntityManager';
import {
  Application,
  Container,
  ENV,
  Graphics,
  Texture,
  settings,
} from 'pixi.js';

import { TimeValue } from '@game/models/common';
import {
  ComponentKind,
  PositionComponent,
  SpeedComponent,
  StateComponent,
  VelocityComponent,
} from '@game/models/component';
import { Entity, EntityKind, NonNullEntityKind } from '@game/models/entity';
import { ISystem } from '@game/models/system';

import MoveSystem from '@game/systems/MoveSystem';
import RenderSystem from '@game/systems/RenderSystem';
import TrackSystem from '@game/systems/TrackSystem';
import VelocityInputSystem from '@game/systems/VelocityInputSystem';
import WaveSystem from '@game/systems/WaveSystem';

import { increasingKeys } from '@game/utils/array';
import { SealedArray } from '@game/utils/container';
import { now } from '@game/utils/time';

settings.PREFER_ENV = ENV.WEBGL2;

export default class Game {
  static readonly MAX_ENTITY_COUNT = 1024;
  static readonly VIEW_WIDTH = window.innerWidth;
  static readonly VIEW_HEIGHT = window.innerHeight;
  private _gameApp: Application;
  private _stage: Container;
  private _textureMaps!: Record<
    NonNullEntityKind,
    Record<string, Texture | Texture[]>
  >;
  private _entityManager: EntityManager;
  private _systems: ISystem[] = [];
  private _timeInfo: {
    start: TimeValue;
  } = { start: NaN as TimeValue };

  private _componentPools = {
    [ComponentKind.Velocity]: SealedArray.from<VelocityComponent>(
      { length: Game.MAX_ENTITY_COUNT },
      () => ({
        inUse: false,
        x: NaN,
        y: NaN,
      })
    ),
    [ComponentKind.Speed]: SealedArray.from<SpeedComponent>(
      { length: Game.MAX_ENTITY_COUNT },
      () => ({
        inUse: false,
        speed: NaN,
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
    [ComponentKind.State]: SealedArray.from<StateComponent>(
      { length: Game.MAX_ENTITY_COUNT },
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
      width: Game.VIEW_WIDTH,
      height: Game.VIEW_HEIGHT,
      backgroundColor: 0xc8b6e2,
      resolution: window.devicePixelRatio,
      autoDensity: true,
    });
    this._stage = new Container();
    this._stage.sortableChildren = true;
    this._gameApp.stage.addChild(this._stage);
    this._entityManager = new EntityManager(this);

    this.initTextureMaps();
  }

  initTextureMaps() {
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
          currentGraphics.drawCircle(0, 0, 0.2 * num);
          currentGraphics.endFill();
          currentGraphics.cacheAsBitmap = true;
          return this.generateTexture(currentGraphics);
        }),
        Shadow: this.generateTexture(
          new Graphics().beginFill(0xfcffe7).drawCircle(0, 0, 11).endFill()
        ),
      },
    };
  }

  start() {
    document.body.appendChild(this._gameApp.view);

    this._timeInfo = Object.freeze({ start: now() });

    /** create the player's avoider */
    this._playerEntity = this._entityManager.createEntity(EntityKind.Avoider);

    /** Game Loop 틱마다 update되는 system들 */
    this._systems.push(
      new WaveSystem(
        (positionX: number, positionY: number) =>
          this._entityManager.createEntity(EntityKind.Tracker, {
            [ComponentKind.Position]: { x: positionX, y: positionY },
          }),
        () => this._entityManager.getEntityCount(EntityKind.Tracker),
        this.getStartTime.bind(this)
      ),
      new TrackSystem(
        this._playerEntity,
        this._componentPools[ComponentKind.State],
        this._componentPools[ComponentKind.Position],
        this._componentPools[ComponentKind.Speed]
      ),
      new MoveSystem(
        this._componentPools[ComponentKind.Position],
        this._componentPools[ComponentKind.Velocity]
      ),
      new RenderSystem(
        this._componentPools[ComponentKind.Position],
        this._componentPools[ComponentKind.State]
      )
    );

    new VelocityInputSystem(
      this._componentPools[ComponentKind.Velocity][this._playerEntity]
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

  getStartTime(): TimeValue {
    return this._timeInfo.start;
  }

  getComponentPools() {
    return this._componentPools;
  }

  getGameStage() {
    return this._stage;
  }

  getTextureMap(kind: NonNullEntityKind): Record<string, Texture | Texture[]> {
    return this._textureMaps[kind];
  }

  generateTexture(graphics: Graphics): Texture {
    return this._gameApp.renderer.generateTexture(graphics);
  }
}

