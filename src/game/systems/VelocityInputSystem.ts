import * as Ecs from 'bitecs';

import {
  AvoiderTag,
  EquippedBulletReference,
  ISystem,
  PlayerTag,
  VelocityStore,
  VelocityType,
} from '@game/models/ecs';

export default class VelocityInputSystem implements ISystem {
  private _boundDeviceOrientationListener =
    this._deviceOrientationListener.bind(this);

  private _queryPlayer = Ecs.defineQuery([PlayerTag]);

  private _latestOrientation?: VelocityType;

  constructor() {
    window.addEventListener(
      'deviceorientation',
      this._boundDeviceOrientationListener
    );
  }

  destroy() {
    window.removeEventListener(
      'deviceorientation',
      this._boundDeviceOrientationListener
    );
  }

  update(world: Ecs.IWorld) {
    if (!this._latestOrientation) return;

    const player = this._queryPlayer(world)[0];
    VelocityStore.x[player] = this._latestOrientation.x;
    VelocityStore.y[player] = this._latestOrientation.y;

    const playerBullet = EquippedBulletReference.bullet[player];
    VelocityStore.x[playerBullet] = this._latestOrientation.x;
    VelocityStore.y[playerBullet] = this._latestOrientation.y;

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

