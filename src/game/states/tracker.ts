import { AnimatedSprite, Container, Sprite, Texture } from 'pixi.js';

import { GameEvent } from '@game/models/event';

import {
  AbstractState,
  InvalidEventTypeError,
  InvalidUseError,
} from './common';

export enum TrackerStateValue {
  Spawning = 'tracker-state/spawning',
  Tracking = 'tracker-state/tracking',
}

export class TrackerSpawningState extends AbstractState {
  private _shadowStage!: Container;

  setShadowStage(shadowStage: Container): this {
    this._shadowStage = shadowStage;
    return this;
  }

  enter(): this {
    if (!this._shadowStage) throw new InvalidUseError();

    const assetBundle = this.getAssetBundle();
    const spawningSprite = new AnimatedSprite(
      assetBundle['spawn-animation-texture'] as Texture[]
    );
    spawningSprite.onComplete = () => {
      this.handleEvent(GameEvent.Spawn);
    };
    spawningSprite.play();
    spawningSprite.loop = false;
    spawningSprite.anchor.set(0.5);
    this._stateComponent.sprites = [spawningSprite];
    this._stage.addChild(spawningSprite);
    return this;
  }

  handleEvent(event: GameEvent) {
    switch (event) {
      case GameEvent.Spawn: {
        this._stateComponent.state = new TrackerTrackingState(
          this._entity,
          this._componentPools,
          this._stage
        )
          .setAssetBundleKey(this._assetBundleKey!)
          .setShadowStage(this._shadowStage)
          .enter();
        break;
      }

      default:
        throw new InvalidEventTypeError();
    }
  }

  valueOf() {
    return TrackerStateValue.Spawning;
  }
}

export class TrackerTrackingState extends AbstractState {
  private _shadowStage?: Container;

  setShadowStage(shadowStage: Container): this {
    this._shadowStage = shadowStage;
    return this;
  }

  enter(): this {
    if (!this._shadowStage) throw new InvalidUseError();

    const assetBundle = this.getAssetBundle();
    const shadowSprite = new Sprite(assetBundle['shadow-texture'] as Texture);
    shadowSprite.zIndex = -1;
    shadowSprite.anchor.set(0.5);
    this._stateComponent.sprites.push(shadowSprite);
    this._shadowStage.addChild(shadowSprite);
    return this;
  }

  valueOf() {
    return TrackerStateValue.Tracking;
  }
}

