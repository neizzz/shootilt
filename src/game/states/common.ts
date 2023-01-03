import { Container, Texture } from 'pixi.js';

import { StateComponent } from '@game/models/component';
import { IState } from '@game/models/state';

/** 상태와 상태에 따른 Sprite 생명주기 관리 (update는 system에서 관리) */
export class AbstractState implements IState {
  protected _textureMap: Record<string, Texture | Texture[]>;
  protected _stage: Container;
  protected _stateComponent?: StateComponent;

  constructor(
    stage: Container,
    textureMap: Record<string, Texture | Texture[]>,
    stateComponent?: StateComponent
  ) {
    this._stage = stage;
    this._textureMap = textureMap;
    this._stateComponent = stateComponent;
  }

  setStateComponent(stateComponent: StateComponent): AbstractState {
    this._stateComponent = stateComponent;
    return this;
  }

  enter(): AbstractState {
    new Error('abstract method');
    return this;
  }

  handleEvent(event: Event | CustomEvent): void {
    new Error('abstract method');
  }

  destroy() {
    this._stateComponent?.sprites.forEach((sprite) => {
      sprite.destroy();
    });
    this._stateComponent && (this._stateComponent.sprites = []);
  }
}

export class InvalidEventTypeError extends Error {
  constructor() {
    super('invalid event type');
  }
}

