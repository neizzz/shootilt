import { Emitter, upgradeConfig } from '@pixi/particle-emitter';
import { ParticleContainer, Texture } from 'pixi.js';

import { Entity, ISystem, PositionStore } from '@game/models/ecs';

export default class TrailEffectSystem implements ISystem {
  private _target: Entity;
  private _prevNow: number;
  private _emitter: Emitter;

  constructor(
    target: Entity,
    particleTexture: Texture,
    container: ParticleContainer
  ) {
    this._target = target;
    this._emitter = new Emitter(
      container,
      upgradeConfig(
        {
          alpha: {
            start: 0.1,
            end: 0.02,
          },
          scale: {
            start: 1,
            end: 0.8,
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
    this._emitter.updateOwnerPos(
      PositionStore.x[this._target],
      PositionStore.y[this._target]
    );
    this._emitter.update((now - this._prevNow) * 0.001);
    this._prevNow = now;
  }

  destroy() {
    this._emitter.destroy();
  }
}

