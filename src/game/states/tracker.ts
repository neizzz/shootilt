import { AnimatedSprite, Container, Sprite, Texture } from 'pixi.js';

import { GameEvent } from '@game/models/event';

import { AbstractState, InvalidEventTypeError } from './common';

export enum TrackerStateValue {
  Spawning = 'tracker-state/spawning',
  Tracking = 'tracker-state/tracking',
}

export class TrackerSpawningState extends AbstractState {
  private _shadowStage: Container; // FIXME:

  constructor(
    shadowStage: Container,
    ...superParams: ConstructorParameters<typeof AbstractState>
  ) {
    super(...superParams);
    this._shadowStage = shadowStage;
  }

  enter(): TrackerSpawningState {
    const spawningSprite = new AnimatedSprite(
      this._textureMap.SpawningBody as Texture[]
    );
    spawningSprite.onComplete = () => {
      this.handleEvent(new CustomEvent(GameEvent.Spawn));
    };
    spawningSprite.play();
    spawningSprite.loop = false;
    spawningSprite.anchor.set(0.5);
    this._stateComponent.sprites = [spawningSprite];
    this._stage.addChild(spawningSprite);
    return this;
  }

  handleEvent(event: Event | CustomEvent) {
    switch (event.type) {
      case GameEvent.Spawn: {
        this._stateComponent.state = new TrackerTrackingState(
          this._shadowStage,
          this._entity,
          this._componentPools,
          this._stage,
          this._textureMap
        ).enter();
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
  private _shadowStage: Container; // FIXME:

  constructor(
    shadowStage: Container,
    ...superParams: ConstructorParameters<typeof AbstractState>
  ) {
    super(...superParams);
    this._shadowStage = shadowStage;
  }

  enter(): TrackerTrackingState {
    const shadowSprite = new Sprite(this._textureMap.Shadow as Texture);
    shadowSprite.zIndex = -1;
    shadowSprite.anchor.set(0.5);
    this._stateComponent.sprites.push(shadowSprite);
    this._shadowStage.addChild(shadowSprite);
    return this;
  }

  // setTargetEntity() {
  // }

  // handleEvent(event: Event | CustomEvent) {
  //   switch (event.type) {
  //     default:
  //       throw new InvalidEventTypeError();
  //   }
  // }

  valueOf() {
    return TrackerStateValue.Tracking;
  }
}

