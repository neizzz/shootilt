import { Application, Container, ParticleContainer, Renderer } from 'pixi.js';

import * as Ecs from 'bitecs';

import { ISystem } from '@game/models/ecs';

import ChaseSystem from '@game/systems/ChaseSystem';
import CollideSystem from '@game/systems/CollideSystem';
import DebugDashboardSystem from '@game/systems/DebugDashboardSystem';
import DebugVelocityInputSystem from '@game/systems/DebugVelocityInputSystem';
import MoveSystem from '@game/systems/MoveSystem';
import ScoreSystem from '@game/systems/ScoreSystem';
import ShootingSystem from '@game/systems/ShootingSystem';
import VelocityInputSystem from '@game/systems/VelocityInputSystem';
import WaveSystem from '@game/systems/WaveSystem';

import { now } from '@game/utils/time';

import { ComponentKind } from './models/constant';
import AvoiderStateSystem from './systems/AvoiderStateSystem';
import BulletStateSystem from './systems/BulletStateSystem';
import ChaserStateSystem from './systems/ChaserStateSystem';
import SinglePlaySystem from './systems/SinglePlaySystem';
import { createAvoider } from './utils/create-entity';

window.GameContext = {
  VIEW_WIDTH: window.innerWidth,
  VIEW_HEIGHT: window.innerHeight,
  MAX_ENTITY_COUNT: 1024,
  renderer: undefined,
};

export const GameContext = window.GameContext;

type GameInitOptions = {
  onEndRound: () => void;
};

export default class Game {
  // TODO: IWorld 검토, 상속받아서 GameContext대용으로 쓸 수 있을 듯
  private _world!: Ecs.IWorld;

  private _gameApp: Application;
  private _stage: Container;
  private _backStage: Container;
  private _particleContainer: ParticleContainer;
  private _systems: ISystem[] = [];
  private _nonUpdateSystems: ISystem[] = [];
  private _timeInfo: {
    start: number;
  } = { start: NaN };

  private _onEndRound!: () => void;

  constructor({ onEndRound }: GameInitOptions) {
    console.debug('Game instance initialized.');

    this._onEndRound = onEndRound;
    this._gameApp = new Application({
      width: GameContext.VIEW_WIDTH,
      height: GameContext.VIEW_HEIGHT,
      backgroundColor: 0x000000,
      resolution: window.devicePixelRatio,
      autoDensity: true,
      powerPreference: 'high-performance',
      antialias: false,
      autoStart: false,
    });

    this._backStage = new Container();
    this._particleContainer = new ParticleContainer();
    this._stage = new Container();
    this._stage.interactive = true;
    this._stage.hitArea = this._gameApp.screen;
    this._gameApp.stage.addChild(
      this._backStage,
      this._particleContainer,
      this._stage
    );

    /** NOTE: (#35)
     * ticker fps세팅을 건들었을때
     * 모바일에선 안정적으로 FPS가 유지되는데,
     * PC(m1 pro기준)에서는 FPS변동이 심해짐 */
    this._gameApp.ticker.minFPS = 30;
    this._gameApp.ticker.maxFPS = 60;

    GameContext.renderer = this._gameApp.renderer as Renderer;

    this._gameApp.ticker
      .add((delta) => {
        this._systems.forEach((system) => system.update(this._world, delta));
      })
      .stop();
  }

  appendViewTo(parentEl: HTMLDivElement) {
    parentEl.appendChild(this._gameApp.view);
  }

  startRound() {
    this._world = Ecs.createWorld();
    this._timeInfo = Object.freeze({ start: now() });

    /** create the player's avoider + bullet */
    createAvoider(this._world, {
      [ComponentKind.Position]: {
        x: GameContext.VIEW_WIDTH / 2,
        y: GameContext.VIEW_HEIGHT / 2,
      },
    });

    /** update */
    this._systems = [
      new DebugDashboardSystem(this._gameApp),
      new WaveSystem(this.getStartTime()),
      new ChaseSystem(),
      new MoveSystem(),
      new CollideSystem(),
      new ScoreSystem(this.getStage()),
      new ShootingSystem(this.getStage()),
      new ChaserStateSystem(this.getStage(), this.getBackStage()),
      new AvoiderStateSystem(this.getStage(), this.getBackStage()),
      new BulletStateSystem(this.getStage(), this.getParticleContainer()),
      new SinglePlaySystem(this),
      new ScoreSystem(this.getStage()),
      new VelocityInputSystem(),
    ];

    this._nonUpdateSystems = [new DebugVelocityInputSystem(this._world)];

    this._startGameLoop();
  }

  restartRound() {
    this.destroy();
    this.startRound();
  }

  endRound() {
    this._stopGameLoop();
    this._onEndRound();
  }

  destroy() {
    console.debug('Game instance destroyed.');
    this._stage.removeChildren();
    this._backStage.removeChildren();
    this._particleContainer.removeChildren();
    this._systems.forEach((system) => system.destroy?.(this._world));
    this._systems = [];
    this._nonUpdateSystems.forEach((system) => system.destroy?.(this._world));
    this._nonUpdateSystems = [];
    Ecs.deleteWorld(this._world);
  }

  getStartTime(): number {
    return this._timeInfo.start;
  }

  getStage(): Container {
    return this._stage;
  }

  getBackStage(): Container {
    return this._backStage;
  }

  getParticleContainer(): ParticleContainer {
    return this._particleContainer;
  }

  private _startGameLoop() {
    this._gameApp.ticker.start();
  }

  private _stopGameLoop() {
    this._gameApp.ticker.stop();
  }
}

