import { Container, Graphics, Sprite } from 'pixi.js';

import * as Ecs from 'bitecs';

import {
  EquippedBulletReference,
  ISystem,
  PlayerTag,
  VelocityStore,
  VelocityType,
} from '@game/models/ecs';

import { generateTexture } from '@game/utils/in-game';

import { PositionStore } from './../models/ecs';

const EPSILON = 0.001;

export default class VelocityInputSystem implements ISystem {
  private _boundDeviceOrientationListener =
    this._deviceOrientationListener.bind(this);

  private _queryPlayer = Ecs.defineQuery([PlayerTag]);

  private _latestOrientation?: VelocityType;
  private _directionArrowSprite: Sprite;

  constructor(frontStage: Container) {
    window.addEventListener(
      'deviceorientation',
      this._boundDeviceOrientationListener
    );

    this._directionArrowSprite = new Sprite(
      (() => {
        const graphics = new Graphics()
          .beginFill(0x6eccaf)
          .moveTo(0, 0)
          .lineTo(3, -8)
          .lineTo(6, 0)
          .endFill();
        graphics.cacheAsBitmap = true;
        return generateTexture(graphics);
      })()
    );
    /** NOTE: avoider 크기에 따라 y-anchor를 변경시켜줘야 함. */
    this._directionArrowSprite.anchor.set(0.5, 2.8);
    frontStage.addChild(this._directionArrowSprite);
  }

  destroy() {
    window.removeEventListener(
      'deviceorientation',
      this._boundDeviceOrientationListener
    );
  }

  update(world: Ecs.IWorld) {
    const player = this._queryPlayer(world)[0];

    /** REFACTOR: 따로 direction arrow만을 위한 system이 있어도 될 듯. */
    this._directionArrowSprite.x = PositionStore.x[player];
    this._directionArrowSprite.y = PositionStore.y[player];

    if (!this._latestOrientation) return;

    const { x, y } = this._latestOrientation;
    const playerBullet = EquippedBulletReference.bullet[player];
    const epsilon = EPSILON;

    VelocityStore.x[player] = x;
    VelocityStore.y[player] = y;

    VelocityStore.x[playerBullet] = x;
    VelocityStore.y[playerBullet] = y;

    let resultRotation = 0;

    if (Math.abs(y) < epsilon) {
      x >= 0 ? (resultRotation = Math.PI / 2) : (resultRotation = -Math.PI / 2);
    } else if (y > 0) {
      Math.abs(x) < epsilon
        ? (resultRotation = Math.PI)
        : (resultRotation = Math.PI - Math.atan(x / y));
    } else if (y < 0) {
      Math.abs(x) < epsilon
        ? (resultRotation = 0)
        : (resultRotation = -Math.atan(x / y));
    }

    this._directionArrowSprite.rotation = resultRotation;
    this._latestOrientation = undefined;
  }

  private _deviceOrientationListener(e: DeviceOrientationEvent) {
    const {
      beta, // x축 방향, [-180, 180]
      gamma, // y축 방향 [-90, 90]
    } = e;

    if (beta === null || gamma === null) {
      throw new Error('device orientation event is not supported');
    }

    this._latestOrientation = this._smoother({ beta, gamma });
  }

  private _smoother(params: { beta: number; gamma: number }): VelocityType {
    const MAX_ANGLE_VALUE = 30;
    const MIN_ANGLE_VALUE = -30;
    const MAX_VELOCITY = 5; // pixel per frame

    let { beta, gamma } = params;

    beta = Math.max(MIN_ANGLE_VALUE, beta);
    beta = Math.min(MAX_ANGLE_VALUE, beta);
    gamma = Math.max(MIN_ANGLE_VALUE, gamma);
    gamma = Math.min(MAX_ANGLE_VALUE, gamma);

    return {
      x: (beta * MAX_VELOCITY) / MAX_ANGLE_VALUE,
      y: (-1 * (gamma * MAX_VELOCITY)) / MAX_ANGLE_VALUE,
    };
  }
}

