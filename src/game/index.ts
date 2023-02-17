import EntityManager from '@game/EntityManager';
import EventBus from '@game/EventBus';
import {
  Application,
  Container,
  Graphics,
  Loader,
  LoaderResource,
  Texture,
} from 'pixi.js';

import {
  CollideComponent,
  ComponentKind,
  PartialComponents,
  PositionComponent,
  StateComponent,
  VelocityComponent,
} from '@game/models/component';
import { ComponentPools } from '@game/models/component';
import { EntityKind } from '@game/models/entity';
import { GameEvent } from '@game/models/event';
import { ISystem } from '@game/models/system';

import CollideSystem from '@game/systems/CollideSystem';
import DebugCollideAreaViewSystem from '@game/systems/DebugCollideAreaViewSystem';
import MoveSystem from '@game/systems/MoveSystem';
import RenderSystem from '@game/systems/RenderSystem';
import ShootingSystem from '@game/systems/ShootingSystem';
import TrackSystem from '@game/systems/TrackSystem';
import TrailEffectSystem from '@game/systems/TrailEffectSystem';
import VelocityInputSystem from '@game/systems/VelocityInputSystem';
import WaveSystem from '@game/systems/WaveSystem';

import { increasingKeys } from '@game/utils/array';
import { SealedArray } from '@game/utils/container';
import { generateTexture } from '@game/utils/in-game';
import { now } from '@game/utils/time';

import DebugDashboardSystem from './systems/DebugDashboardSystem';
import ScoreSystem from './systems/ScoreSystem';

export const GameContext = window.GameContext;

type GameInitOptions = {
  onEndRound: () => void;
};

export default class Game {
  private _gameApp!: Application;
  private _stage?: Container;
  private _textureMaps!: Partial<
    Record<EntityKind, Record<string, Texture | Texture[]>>
  >;
  private _eventBus!: EventBus;
  private _entityManager!: EntityManager;
  private _systems: ISystem[] = [];
  private _nonUpdateSystems: ISystem[] = [];
  private _timeInfo: {
    start: number;
  } = { start: NaN };

  private _componentPools!: ComponentPools;
  private _onEndRound!: () => void;

  constructor({ onEndRound }: GameInitOptions) {
    this._onEndRound = onEndRound;
    this._gameApp = new Application({
      width: GameContext.VIEW_WIDTH,
      height: GameContext.VIEW_HEIGHT,
      backgroundColor: 0x000000,
      resolution: window.devicePixelRatio,
      autoDensity: true,
      antialias: true,
      powerPreference: 'high-performance',
      autoStart: false,
    });

    this._stage = new Container();
    this._stage.sortableChildren = true;
    this._stage.interactive = true;
    this._stage.hitArea = this._gameApp.screen;
    this._gameApp.stage.addChild(this._stage);

    /** NOTE:
     * ticker fps세팅을 건들었을때
     * 모바일에선 안정적으로 FPS가 유지되는데,
     * PC(m1 pro기준)에서는 FPS변동이 심해짐 */
    this._gameApp.ticker.minFPS = 30;
    this._gameApp.ticker.maxFPS = 60;
    window.GameContext.renderer = this._gameApp.renderer;

    this._initTextureMaps();

    this._gameApp.ticker.add((delta) => {
      this._systems.forEach((system) => system.update(delta)); // convert to second
    });
  }

  init() {
    this._initComponents();

    this._entityManager = new EntityManager(this);
    this._eventBus = new EventBus(
      this,
      this._entityManager,
      this._componentPools[ComponentKind.State]
    );
  }

  appendViewTo(parentEl: HTMLDivElement) {
    parentEl.appendChild(this._gameApp.view);
  }

  startRound() {
    this._timeInfo = Object.freeze({ start: now() });

    /** create the player's avoider */
    const playerEntity = this._entityManager.createEntity(EntityKind.Avoider);
    this._entityManager.setPlayerEntity(playerEntity);

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
        playerEntity,
        this._componentPools[ComponentKind.State],
        this._componentPools[ComponentKind.Position],
        this._componentPools[ComponentKind.Velocity],
        this._componentPools[ComponentKind.Collide]
      ),
      new MoveSystem(
        this._eventBus,
        this._componentPools[ComponentKind.Position],
        this._componentPools[ComponentKind.Velocity]
      ),
      new CollideSystem(
        this._eventBus,
        this._componentPools[ComponentKind.Collide],
        this._componentPools[ComponentKind.Position]
      ),
      new DebugCollideAreaViewSystem(
        this.getGameStage(),
        this._componentPools[ComponentKind.Collide],
        this._componentPools[ComponentKind.Position]
      ),
      new DebugDashboardSystem(this._gameApp),
      new RenderSystem(
        this._componentPools[ComponentKind.Position],
        this._componentPools[ComponentKind.State]
      ),
      new TrailEffectSystem(
        this._componentPools[ComponentKind.Position][playerEntity],
        this._gameApp.stage
      ),
      new ShootingSystem(
        this.getGameStage(),
        this._componentPools[ComponentKind.Position][playerEntity],
        (initComponents: PartialComponents) => {
          this._entityManager.createEntity(EntityKind.Bullet, initComponents);
        }
      )
    );

    this._nonUpdateSystems = [
      new VelocityInputSystem(
        this._componentPools[ComponentKind.Velocity][playerEntity]
      ),
      new ScoreSystem(this._stage!, this._eventBus),
    ];

    this._startGameLoop();
  }

  restartRound() {
    this.destroy();
    this.init();
    this.startRound();
  }

  endRound() {
    this._stopGameLoop();
    this._onEndRound();
  }

  destroy() {
    this._stage?.removeChildren();
    this._systems.forEach((system) => system.destroy?.());
    this._systems = [];
    this._nonUpdateSystems.forEach((system) => system.destroy?.());
    this._nonUpdateSystems = [];
  }

  getStartTime(): number {
    return this._timeInfo.start;
  }

  getComponentPools() {
    return this._componentPools;
  }

  getGameStage(): Container {
    return this._stage as Container;
  }

  getTextureMap(kind: EntityKind): Record<string, Texture | Texture[]> {
    const textureMap = this._textureMaps[kind];

    if (textureMap === undefined) {
      throw new Error('not existing texture map');
    } else {
      return textureMap;
    }
  }

  private _startGameLoop() {
    this._gameApp.ticker.start();
  }

  private _stopGameLoop() {
    this._gameApp.ticker.stop();
  }

  private _initTextureMaps() {
    this._textureMaps = {
      [EntityKind.Avoider]: {
        Body: generateTexture(
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
          return generateTexture(currentGraphics);
        }),
        Shadow: (() => {
          const graphics = new Graphics()
            .beginFill(0xfcffe7)
            .drawCircle(0, 0, 8)
            .endFill();
          graphics.cacheAsBitmap = true;
          return generateTexture(graphics);
        })(),
      },
      [EntityKind.Bullet]: {
        BasicBody: Texture.from(`${__IMAGE_ASSET_DIR__}/fire-bullet.png`),
        FireBody: Texture.from(`${__IMAGE_ASSET_DIR__}/fire-bullet.png`),
        IceBody: Texture.from(`${__IMAGE_ASSET_DIR__}/ice-bullet.png`),
      },
    };
  }

  private _initComponents() {
    this._componentPools = {
      [ComponentKind.Velocity]: SealedArray.from<VelocityComponent>(
        { length: GameContext.MAX_ENTITY_COUNT },
        () => ({
          inUse: false,
          vx: NaN,
          vy: NaN,
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
          rotation: 0,
          sprites: [],
        })
      ),
      [ComponentKind.Collide]: SealedArray.from<CollideComponent>(
        { length: GameContext.MAX_ENTITY_COUNT },
        () => ({
          inUse: false,
          distFromCenter: { x: NaN, y: NaN },
          radius: NaN,
          targetEntitiesRef: { current: [] },
          eventToTarget: GameEvent.None,
        })
      ),
    };
  }
}

