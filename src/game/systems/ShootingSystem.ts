import EventBus from '@game/EventBus';
import { Container, Graphics, InteractionEvent, LINE_JOIN } from 'pixi.js';

import { ComponentKind, PositionComponent } from '@game/models/component';
import { Entity } from '@game/models/entity';
import { GameEvent } from '@game/models/event';
import { ISystem } from '@game/models/system';

import { distance, theta } from '@game/utils/in-game';

const ARROW_WIDTH = 24;
const ARROW_HALF_WIDTH = ARROW_WIDTH / 2;
const MAX_SIGHT_LINE_LENGTH = 200;
const MAX_BULLET_SPEED = 6;
const COLOR = 0xffffff;

export default class ShootingSystem implements ISystem {
  private _stage: Container;
  private _playerPosition: PositionComponent; // TODO: player's context
  private _eventBus: EventBus;

  private _currentBulletEntity?: Entity;
  private _boundBulletLoadEndListener = this._bulletLoadEndListener.bind(this);

  private _sightLineGraphics?: Graphics;
  private _dragContext?: {
    startPoint: SimplePoint;
    distance: number;
    rotation: number;
  };

  constructor(
    stage: Container,
    playerPosition: PositionComponent,
    eventBus: EventBus
  ) {
    this._stage = stage;
    this._playerPosition = playerPosition;
    this._eventBus = eventBus;

    this._stage.on('pointerdown', this._dragStart, this);
    this._stage.on('pointerup', this._dragEnd, this);
    this._stage.on('pointerupoutside', this._dragEnd, this);

    this._eventBus.register(
      GameEvent.BulletLoadEnd,
      this._boundBulletLoadEndListener
    );
  }

  destroy() {
    this._stage.off('pointerdown', this._dragStart, this);
    this._stage.off('pointerup', this._dragEnd, this);
    this._stage.off('pointerupoutside', this._dragEnd, this);
  }

  update() {
    if (!this._sightLineGraphics || !this._dragContext) return;

    const { distance, rotation } = this._dragContext;

    /** rotate */
    this._sightLineGraphics.pivot = {
      x: ARROW_HALF_WIDTH,
      y: distance,
    };
    this._sightLineGraphics.rotation = rotation;

    /** move */
    this._sightLineGraphics.position = {
      x: this._playerPosition.x,
      y: this._playerPosition.y,
    };
  }

  private _bulletLoadEndListener(bulletEntity: Entity) {
    this._currentBulletEntity = bulletEntity;
  }

  private _drawSightLine() {
    if (!this._sightLineGraphics || !this._dragContext) {
      throw new Error('invalid function call');
    }

    const d = this._dragContext.distance;

    this._sightLineGraphics.clear();
    this._sightLineGraphics.beginFill(COLOR, 0.6);
    this._sightLineGraphics
      .lineStyle({
        width: 1,
        color: COLOR,
        // alignment: 0.5,
        alpha: 0.6,
        join: LINE_JOIN.MITER,
        // cap: LINE_CAP.,
      })
      .moveTo(0, 14)
      .lineTo(ARROW_HALF_WIDTH, 0)
      .lineTo(ARROW_WIDTH, 14)
      .lineTo(ARROW_HALF_WIDTH + 4, 10)
      .lineTo(ARROW_HALF_WIDTH, d)
      .lineTo(ARROW_HALF_WIDTH - 4, 10)
      .closePath();
    this._sightLineGraphics.endFill();
  }

  private _dragStart(e: InteractionEvent) {
    const { x, y } = e.data.global;
    this._dragContext = {
      startPoint: { x, y },
      distance: 0,
      rotation: 0,
    };
    this._sightLineGraphics = new Graphics();
    this._stage.addChild(this._sightLineGraphics);
    this._stage.on('pointermove', this._dragMove, this);
  }

  private _dragMove(e: InteractionEvent) {
    if (!this._dragContext) {
      throw new Error('drag context is not initialized');
    }

    const { x, y } = e.data.global;
    this._dragContext.distance = Math.min(
      distance(this._dragContext.startPoint, { x, y }),
      MAX_SIGHT_LINE_LENGTH
    );
    this._dragContext.rotation = theta(this._dragContext.startPoint, { x, y });

    this._drawSightLine();
  }

  private _dragEnd(e: InteractionEvent) {
    if (!this._dragContext) return;
    if (!this._currentBulletEntity) {
      this._reset();
      /** TODO: not yet bullet sound */
      return;
    }

    const d = this._sightLineGraphics!.pivot.y;
    const theta = this._sightLineGraphics!.rotation;
    const speed = 1 + ((MAX_BULLET_SPEED - 1) * d) / MAX_SIGHT_LINE_LENGTH;

    this._eventBus.dispatchToEntity(
      GameEvent.BulletShoot,
      this._currentBulletEntity,
      {
        velocityComponent: {
          vx: speed * Math.sin(theta),
          vy: -1 * speed * Math.cos(theta),
        },
      }
    );

    this._reset();
  }

  private _reset() {
    if (this._sightLineGraphics) {
      this._sightLineGraphics.destroy();
      this._sightLineGraphics = undefined;
    }

    if (this._dragContext) {
      this._dragContext = undefined;
    }

    this._currentBulletEntity = undefined;

    this._stage.off('pointermove', this._dragMove, this);
  }
}

