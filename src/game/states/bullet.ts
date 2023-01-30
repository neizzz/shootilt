import { Sprite, Texture } from 'pixi.js';

import { GameEvent } from './../models/event';
import { AbstractState } from './common';

export class BulletShootingState extends AbstractState {
  private _feature: 'Basic' | 'Fire' | 'Ice' = 'Basic';

  /** TODO: */
  // setFeature(feature: 'Basic' | 'Fire' | 'Ice'): BulletShootingState {
  //   this._feature = feature;
  //   return this;
  // }

  enter(): BulletShootingState {
    const sprite = new Sprite(
      this._textureMap[this._feature + 'Body'] as Texture // FIXME: magic string
    );
    sprite.anchor.set(0.5);
    this._stateComponent.sprites = [sprite];
    this._stage.addChild(sprite);
    return this;
  }

  handleEvent(event: Event | CustomEvent) {
    switch (event.type) {
      case GameEvent.OutsideStage: {
        this.destroy();
        this._stateComponent.state = undefined;
        break;
      }
    }
  }
}

