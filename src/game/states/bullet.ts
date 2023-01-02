import { Sprite, Texture } from 'pixi.js';

import { BulletEvent } from '@game/models/event';

import { AbstractState, InvalidEventTypeError } from './common';

export class BulletShootingState extends AbstractState {
  enter(): BulletShootingState {
    const sprite = new Sprite(this._textureMap.Body as Texture);
    sprite.anchor.set(0.5);
    this._stateComponent.sprites = [sprite];
    this._stage.addChild(sprite);
    return this;
  }

  handleEvent(event: Event | CustomEvent) {
    switch (event.type) {
      case BulletEvent.Out: {
        this._stateComponent.state?.destroy();
        this._stateComponent.state = undefined;
        this._stateComponent.sprites = [];
        break;
      }

      default:
        throw new InvalidEventTypeError();
    }
  }
}

