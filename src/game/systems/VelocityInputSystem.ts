import { IComponent, VelocityComponent } from '@game/models/component';
import { ISystem } from '@game/models/system';

export default class VelocityInputSystem implements ISystem {
  private _boundDeviceOrientationListener =
    this._deviceOrientationListener.bind(this);
  private _targetVelocityComponent: VelocityComponent;

  constructor(targetVelocityComponent: VelocityComponent) {
    this._targetVelocityComponent = targetVelocityComponent;

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

  update({ x, y }: Omit<VelocityComponent, keyof IComponent>) {
    if (!this._targetVelocityComponent.inUse) return;
    this._targetVelocityComponent.x = x;
    this._targetVelocityComponent.y = y;
  }

  private _deviceOrientationListener(e: DeviceOrientationEvent) {
    const {
      beta, // x축 방향, [-180, 180]
      gamma, // y축 방향 [-90, 90]
    } = e;

    if (beta === null || gamma === null) {
      throw new Error('device orientation event is not supported');
    }

    this.update(this._smoother({ beta, gamma }));
  }

  private _smoother(params: {
    beta: number;
    gamma: number;
  }): Omit<VelocityComponent, keyof IComponent> {
    const MAX_ANGLE_VALUE = 45;
    const MIN_ANGLE_VALUE = -45;
    const MAX_VELOCITY = 3; // pixel per frame

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

