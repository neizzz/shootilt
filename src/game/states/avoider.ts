import { Sprite, Texture } from 'pixi.js';

import { AbstractState } from './common';

export enum AvoiderStateValue {
  Controlled = 'avoider-state/controlled',
}

export class AvoiderControlledState extends AbstractState {
  enter(): this {
    const assetBundle = this.getAssetBundle();
    const sprite = new Sprite(assetBundle['body-texture'] as Texture);
    sprite.anchor.set(0.5);
    this._stateComponent.sprites.push(sprite);
    this._stage.addChild(sprite);
    return this;
  }

  valueOf() {
    return AvoiderStateValue.Controlled;
  }
}

