import { AnimatedSprite, Sprite, Texture } from 'pixi.js';

import { TrackerEvent } from '@game/models/event';

import { AbstractState } from './common';

export class TrackerSpawningState extends AbstractState {
  enter(): TrackerSpawningState {
    const spawningSprite = new AnimatedSprite(
      this._textureMap.SpawningBody as Texture[]
    );
    spawningSprite.onComplete = () => {
      this.handleEvent(new CustomEvent(TrackerEvent.SpawnEnd));
    };
    spawningSprite.play();
    spawningSprite.loop = false;
    spawningSprite.anchor.set(0.5);
    this._stateComponent.sprites = [spawningSprite];
    this._stage.addChild(spawningSprite);
    return this;
  }

  handleEvent(event: Event | CustomEvent) {
    if (event.type === TrackerEvent.SpawnEnd) {
      this._stateComponent.state = new TrackerTrackingState(
        this._stage,
        this._textureMap,
        this._stateComponent
      ).enter();
    } else {
      return;
    }
  }
}

export class TrackerTrackingState extends AbstractState {
  enter(): TrackerTrackingState {
    const shadowSprite = new Sprite(this._textureMap.Shadow as Texture);
    shadowSprite.zIndex = -1;
    shadowSprite.anchor.set(0.5);
    this._stateComponent.sprites.push(shadowSprite);
    this._stage.addChild(shadowSprite);
    return this;
  }

  // handleEvent(event: Event | CustomEvent) {}
}

