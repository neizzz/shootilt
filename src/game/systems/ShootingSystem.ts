import {
  Container,
  Graphics,
  ISystem,
  InteractionData,
  InteractionEvent,
  LINE_CAP,
  LINE_JOIN,
} from 'pixi.js';

import { PositionComponent } from '@game/models/component';

type Point = { x: number; y: number };

export default class ShootingSystem implements ISystem {
  private _stage: Container;
  private _playerPosition: PositionComponent;
  private _sightLineGraphics?: Graphics;
  // private _createTargetLine: ;

  private _dragStartPoint?: Point;

  constructor(stage: Container, playerPosition: PositionComponent) {
    this._stage = stage;
    this._playerPosition = playerPosition;
    this._stage.on('pointerdown', this._dragStart, this);
    this._stage.on('pointerup', this._dragEnd, this);
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
    let theta = diffX === 0 ? 0 : Math.atan(diffY / diffX);
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
    const d = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
    const width = 24;
    const halfWidth = width / 2;

    this._sightLineGraphics.clear();
    this._sightLineGraphics.beginFill(0xcccccc, 0.6);
    this._sightLineGraphics
      .lineStyle({
        width: 1,
        color: 0xffffff,
        // alignment: 0.5,
        alpha: 0.6,
        join: LINE_JOIN.MITER,
        // cap: LINE_CAP.,
      })
      .moveTo(0, 14)
      .lineTo(halfWidth, 0)
      .lineTo(width, 14)
      .lineTo(halfWidth + 4, 10)
      .lineTo(halfWidth, d)
      .lineTo(halfWidth - 4, 10)
      .closePath();
    this._sightLineGraphics.endFill();

    // rotate
    this._sightLineGraphics.pivot = {
      x: halfWidth,
      y: d,
    };
    this._sightLineGraphics.rotation = theta;

    // move
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

    const { x, y } = e.data.global;
    // TODO: shoot

    this._dragStartPoint = undefined;
    this._stage.removeChild(this._sightLineGraphics!);
    this._sightLineGraphics!.destroy();
    this._stage.off('pointermove', this._dragMove, this);
  }
}

