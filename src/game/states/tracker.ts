import { AnimatedSprite, Sprite, Texture } from 'pixi.js';

import { ComponentKind } from '@game/models/component';
import { GameEvent } from '@game/models/event';

import { AbstractState, InvalidEventTypeError } from './common';

export class TrackerSpawningState extends AbstractState {
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
}

export class TrackerTrackingState extends AbstractState {
  enter(): TrackerTrackingState {
    const shadowSprite = new Sprite(this._textureMap.Shadow as Texture);
    shadowSprite.zIndex = -1;
    shadowSprite.anchor.set(0.5);
    this._stateComponent.sprites.push(shadowSprite);
    this._stage.addChild(shadowSprite);

    const collideComponent =
      this._componentPools[ComponentKind.Collide][this._entity];
    collideComponent.inUse = true;
    collideComponent.distFromCenter = { x: 0, y: 0 };
    collideComponent.radius =
      this._stateComponent.sprites[0].getBounds().width / 2;
    return this;
  }

  // handleEvent(event: Event | CustomEvent) {
  //   switch (event.type) {
  //     default:
  //       throw new InvalidEventTypeError();
  //   }
  // }
}

