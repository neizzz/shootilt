import { Emitter, upgradeConfig } from '@pixi/particle-emitter';
import { ParticleContainer, Texture } from 'pixi.js';

import { PositionComponent } from '@game/models/component';
import { ISystem } from '@game/models/system';

export default class TrailEffectSystem implements ISystem {
  private _targetPositionComponent: PositionComponent;
  private _prevNow: number;
  private _emitter: Emitter;

  constructor(
    targetPositionComponent: PositionComponent,
    particleTexture: Texture,
    container: ParticleContainer
  ) {
    this._targetPositionComponent = targetPositionComponent;
    this._emitter = new Emitter(
      container,
      upgradeConfig(
        {
          alpha: {
            start: 0.8,
            end: 0.15,
          },
          scale: {
            start: 1,
            end: 0.2,
            minimumScaleMultiplier: 1,
          },
          color: {
            start: '#e3f9ff',
            end: '#2196F3',
          },
          speed: {
            start: 0,
            end: 0,
            minimumSpeedMultiplier: 1,
          },
          acceleration: {
            x: 0,
            y: 0,
          },
          maxSpeed: 0,
          startRotation: {
            min: 0,
            max: 0,
          },
          noRotation: true,
          rotationSpeed: {
            min: 0,
            max: 0,
          },
          lifetime: {
            min: 0.2,
            max: 0.2,
          },
          blendMode: 'normal',
          frequency: 0.001,
          emitterLifetime: -1,
          maxParticles: 300,
          pos: {
            x: 0,
            y: 0,
          },
          addAtBack: false,
          spawnType: 'point',
        },
        [particleTexture]
      )
    );

    this._emitter.emit = true;
    this._prevNow = performance.now();
  }

  update() {
    const now = performance.now();
    const { x, y } = this._targetPositionComponent;
    this._emitter.updateOwnerPos(x, y);
    this._emitter.update((now - this._prevNow) * 0.001);
    this._prevNow = now;
  }

  destroy() {
    this._emitter.destroy();
  }
}

