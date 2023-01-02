import { Container, Texture } from 'pixi.js';

import { StateComponent } from '@game/models/component';
import { IState } from '@game/models/state';

export class AbstractState implements IState {
  protected _textureMap: Record<string, Texture | Texture[]>;
  protected _stage: Container;
  protected _stateComponent: StateComponent;

  constructor(
    stage: Container,
    textureMap: Record<string, Texture | Texture[]>,
    stateComponent: StateComponent
  ) {
    this._stage = stage;
    this._textureMap = textureMap;
    this._stateComponent = stateComponent;
  }

  enter(...args: any): ThisType<AbstractState> {
    new Error('abstract method');
    return this;
  }

  handleEvent(event: Event | CustomEvent): void {
    new Error('abstract method');
  }

  destroy() {
    this._stateComponent.sprites.forEach((sprite) => {
      sprite.destroy();
    });
    this._stateComponent.sprites = [];
  }
}

export class InvalidEventTypeError extends Error {
  constructor() {
    super('invalid event type');
  }
}

