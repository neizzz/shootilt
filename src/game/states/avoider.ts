import { Sprite, Texture } from 'pixi.js';

import { AbstractState } from './common';

export enum AvoiderStateValue {
  Controlled = 'avoider-state/controlled',
}

export class AvoiderControlledState extends AbstractState {
  enter(): AvoiderControlledState {
    const sprite = new Sprite(this._textureMap.Body as Texture);
    sprite.anchor.set(0.5);
    this._stateComponent.sprites.push(sprite);
    this._stage.addChild(sprite);
    return this;
  }

  valueOf() {
    return AvoiderStateValue.Controlled;
  }
}

