import gsap from 'gsap';
import { BLEND_MODES, Container, SimpleRope, Texture } from 'pixi.js';
import { Point as PixiPoint } from 'pixi.js';

import { PositionComponent } from '@game/models/component';
import { ISystem } from '@game/models/system';

const HISTORY_SIZE = 20;
const ROPE_SIZE = 10;

export default class TrailEffectSystem implements ISystem {
  private _targetPositionComponent: PositionComponent;
  private _prevTargetPosition: SimplePoint;
  private _historyX = [] as number[];
  private _historyY = [] as number[];
  private _trailPoints = [] as PixiPoint[];
  private _rope: SimpleRope;

  constructor(targetPositionComponent: PositionComponent, stage: Container) {
    this._targetPositionComponent = targetPositionComponent;
    this._prevTargetPosition = {
      x: targetPositionComponent.x,
      y: targetPositionComponent.y,
    };
    for (let i = 0; i < HISTORY_SIZE; i++) {
      this._historyX.push(this._prevTargetPosition.x);
      this._historyY.push(this._prevTargetPosition.y);
    }
    for (let i = 0; i < ROPE_SIZE; i++) {
      this._trailPoints.push(
        new PixiPoint(this._prevTargetPosition.x, this._prevTargetPosition.y)
      );
    }
    this._rope = new SimpleRope(
      this._createTrailTexture('white'),
      this._trailPoints
    );
    this._rope.blendMode = BLEND_MODES.ADD;
    stage.addChildAt(this._rope, 0);
  }

  update() {
    const duration = 5;
    const { x, y } = this._targetPositionComponent;
    gsap.to(
      {
        ...this._prevTargetPosition,
      },
      {
        x,
        y,
        duration,
        onUpdateParams: [new PixiPoint(x, y)],
        onUpdate: this._drawTrail.bind(this),
      }
    );
    this._prevTargetPosition = {
      x: this._targetPositionComponent.x,
      y: this._targetPositionComponent.y,
    };
  }

  destroy() {
    this._rope.destroy();
  }

  private _drawTrail(point: PixiPoint) {
    this._historyX.pop();
    this._historyX.unshift(point.x);
    this._historyY.pop();
    this._historyY.unshift(point.y);

    // Update the points to correspond with history.
    for (let i = 0; i < ROPE_SIZE; i++) {
      const point = this._trailPoints[i];

      // Smooth the curve with cubic interpolation to prevent sharp edges.
      const ix = this._cubicInterpolation(
        this._historyX,
        (i / ROPE_SIZE) * HISTORY_SIZE,
        0.5
      );
      const iy = this._cubicInterpolation(
        this._historyY,
        (i / ROPE_SIZE) * HISTORY_SIZE,
        0.5
      );

      point.x = ix;
      point.y = iy;
    }
  }

  private _clipInput(k: number, arr: number[]) {
    if (k < 0) k = 0;
    if (k > arr.length - 1) k = arr.length - 1;
    return arr[k];
  }

  private _getTangent(k: number, factor: number, arr: number[]) {
    return (
      (factor * (this._clipInput(k + 1, arr) - this._clipInput(k - 1, arr))) / 2
    );
  }

  /** Cubic interpolation based on https://github.com/osuushi/Smooth.js */
  private _cubicInterpolation(
    arr: number[],
    t: number,
    tangentFactor?: number
  ) {
    if (tangentFactor == null) tangentFactor = 1;

    const k = Math.floor(t);
    const m = [
      this._getTangent(k, tangentFactor, arr),
      this._getTangent(k + 1, tangentFactor, arr),
    ];
    const p = [this._clipInput(k, arr), this._clipInput(k + 1, arr)];
    t -= k;
    const t2 = t * t;
    const t3 = t * t2;
    return (
      (2 * t3 - 3 * t2 + 1) * p[0] +
      (t3 - 2 * t2 + t) * m[0] +
      (-2 * t3 + 3 * t2) * p[1] +
      (t3 - t2) * m[1]
    );
  }

  private _createTrailTexture(color: string, tickness?: number): Texture {
    const TRAIL_LENGTH = 128;
    const TRAIL_TICKNESS = tickness ?? 14;

    const canvas = document.createElement('canvas');
    canvas.width = TRAIL_LENGTH;
    canvas.height = TRAIL_TICKNESS;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('canvas is not supported.');
    }

    const gradient = ctx.createLinearGradient(0, 0, TRAIL_LENGTH, 0);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, TRAIL_LENGTH, TRAIL_TICKNESS);

    return Texture.from(canvas);
  }
}

