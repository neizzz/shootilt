import { Application } from 'pixi.js';

import EntityManager from '@game/EntityManager';
import { TimeValue } from '@game/models/common';
import {
  AppearanceComponent,
  ComponentKind,
  PositionComponent,
  SpeedComponent,
  VelocityComponent,
} from '@game/models/component';
import { Entity, EntityKind } from '@game/models/entity';
import { ISystem } from '@game/models/system';
import MoveSystem from '@game/systems/MoveSystem';
import RenderSystem from '@game/systems/RenderSystem';
import TrackSystem from '@game/systems/TrackSystem';
import VelocityInputSystem from '@game/systems/VelocityInputSystem';
import WaveSystem from '@game/systems/WaveSystem';
import { SealedArray } from '@game/utils/container';
import { now } from '@game/utils/time';

export default class Game {
  static readonly MAX_ENTITY_COUNT = 1024;
  static readonly VIEW_WIDTH = window.innerWidth;
  static readonly VIEW_HEIGHT = window.innerHeight;
  private _gameApp: Application;
  private _entityManager: EntityManager;
  private _systems: ISystem[] = [];
  private _timeInfo: {
    start: TimeValue;
  } = { start: NaN as TimeValue };

  componentsPool = {
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
    [ComponentKind.Appearance]: SealedArray.from<AppearanceComponent>(
      { length: Game.MAX_ENTITY_COUNT },
      () => ({
        inUse: false,
        kind: EntityKind.NULL,
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
    this._entityManager = new EntityManager(this);
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
        this.componentsPool[ComponentKind.Position],
        this.componentsPool[ComponentKind.Speed]
      ),
      new MoveSystem(
        this.componentsPool[ComponentKind.Position],
        this.componentsPool[ComponentKind.Velocity]
      ),
      new RenderSystem(
        this._gameApp.stage,
        this._gameApp.renderer,
        this.componentsPool[ComponentKind.Position],
        this.componentsPool[ComponentKind.Appearance]
      )
    );

    new VelocityInputSystem(
      this.componentsPool[ComponentKind.Velocity][this._playerEntity]
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
}

