import {
  Container,
  Graphics,
  ISystem,
  InteractionEvent,
  LINE_CAP,
  LINE_JOIN,
} from 'pixi.js';

import { GameContext } from '@game';

import {
  ComponentKind,
  PartialComponents,
  PositionComponent,
} from '@game/models/component';

import { BulletShootingState } from '@game/states/bullet';

type Point = { x: number; y: number };
type BulletStateCreator = () => BulletShootingState;
type BulletCreator = (initComponents: PartialComponents) => void;

export default class ShootingSystem implements ISystem {
  readonly MAX_SIGHT_LINE_LENGTH = GameContext.VIEW_HEIGHT / 2;
  readonly MAX_BULLET_SPEED = 4;
  private _stage: Container;
  private _playerPosition: PositionComponent; // TODO: player's context
  private _sightLineGraphics?: Graphics;
  private _createBulletState: BulletStateCreator;
  private _createBullet: BulletCreator;

  private _dragStartPoint?: Point;

  constructor(
    stage: Container,
    playerPosition: PositionComponent,
    bulletStateCreator: BulletStateCreator,
    bulletCreator: BulletCreator
  ) {
    this._stage = stage;
    this._playerPosition = playerPosition;
    this._createBulletState = bulletStateCreator;
    this._createBullet = bulletCreator;
    this._stage.on('pointerdown', this._dragStart, this);
    this._stage.on('pointerup', this._dragEnd, this);
    this._stage.on('pointerupoutside', this._dragEnd, this);
  }

  destroy() {
    this._stage.off('pointerdown', this._dragStart, this);
    this._stage.off('pointerup', this._dragEnd, this);
    this._stage.off('pointerupoutside', this._dragEnd, this);
  }

  update(endPoint: Point) {
    this._drawSightLine(this._dragStartPoint!, endPoint);
  }

  private _calcTheta(diffX: number, diffY: number) {
    let theta: number;

    if (diffX === 0) {
      theta = diffY < 0 ? 0 : Math.PI;
    } else {
      theta = Math.atan(diffY / diffX);
    }

    if (diffX > 0) {
      theta += Math.PI / 2;
    } else if (diffX < 0) {
      theta += Math.PI + Math.PI / 2;
    }
    return theta;
  }

  private _drawSightLine(basePoint: Point, targetPoint: Point) {
    if (!this._sightLineGraphics) {
      throw new Error('invalid sight line graphics');
    }

    const diffX = targetPoint.x - basePoint.x;
    const diffY = targetPoint.y - basePoint.y;

    const theta = this._calcTheta(diffX, diffY);
    const d = Math.min(
      Math.sqrt(diffX * diffX + diffY * diffY),
      this.MAX_SIGHT_LINE_LENGTH
    );
    const WIDTH = 24;
    const HALF_WIDTH = WIDTH / 2;
    const COLOR = 0xffffff;

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
      .lineTo(HALF_WIDTH, 0)
      .lineTo(WIDTH, 14)
      .lineTo(HALF_WIDTH + 4, 10)
      .lineTo(HALF_WIDTH, d)
      .lineTo(HALF_WIDTH - 4, 10)
      .closePath();
    this._sightLineGraphics.endFill();

    /** rotate */
    this._sightLineGraphics.pivot = {
      x: HALF_WIDTH,
      y: d,
    };
    this._sightLineGraphics.rotation = theta;

    /** move */
    this._sightLineGraphics.position = {
      x: this._playerPosition.x,
      y: this._playerPosition.y,
    };
  }

  private _dragStart(e: InteractionEvent) {
    const { x, y } = e.data.global;
    this._dragStartPoint = { x, y };
    this._sightLineGraphics = new Graphics();
    this._stage.addChild(this._sightLineGraphics);
    this._stage.on('pointermove', this._dragMove, this);
  }

  private _dragMove(e: InteractionEvent) {
    const { x, y } = e.data.global;
    this.update({ x, y });
  }

  private _dragEnd(e: InteractionEvent) {
    if (!this._dragStartPoint) return;

    const d = this._sightLineGraphics!.pivot.y;
    const theta = this._sightLineGraphics!.rotation;
    const speed =
      1 + ((this.MAX_BULLET_SPEED - 1) * d) / this.MAX_SIGHT_LINE_LENGTH;

    // TODO: decide bullet's kind

    this._createBullet({
      [ComponentKind.Position]: this._playerPosition,
      [ComponentKind.Velocity]: {
        x: speed * Math.sin(theta),
        y: -1 * speed * Math.cos(theta),
      },
      [ComponentKind.State]: {
        state: this._createBulletState().setFeature('Basic'),
        rotation: theta,
      },
    });

    this._dragStartPoint = undefined;
    this._stage.removeChild(this._sightLineGraphics!);
    this._sightLineGraphics!.destroy();
    this._stage.off('pointermove', this._dragMove, this);
  }
}

