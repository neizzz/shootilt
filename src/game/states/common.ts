import { Container, State, Texture } from 'pixi.js';

import {
  ComponentKind,
  ComponentPools,
  StateComponent,
} from '@game/models/component';
import { Entity } from '@game/models/entity';
import { IState } from '@game/models/state';

/** 상태와 상태에 따른 Sprite 생명주기 관리 (update는 system에서 관리) */
export class AbstractState implements IState {
  protected _entity: Entity;
  protected _textureMap: Record<string, Texture | Texture[]>;
  protected _stage: Container;
  protected _componentPools: ComponentPools;
  protected _stateComponent: StateComponent;

  constructor(
    entity: Entity,
    componentPools: ComponentPools,
    stage: Container,
    textureMap: Record<string, Texture | Texture[]>
  ) {
    this._entity = entity;
    this._stage = stage;
    this._textureMap = textureMap;
    this._componentPools = componentPools;
    this._stateComponent = this._componentPools[ComponentKind.State][entity];
  }

  enter(params?: any): AbstractState {
    new Error('abstract method');
    return this;
  }

  handleEvent(event: Event | CustomEvent): void {
    new Error('abstract method');
  }

  destroy() {
    this._stateComponent.sprites.forEach((sprite) => {
      sprite.destroy({
        children: true,
      });
    });
    this._stateComponent.sprites = [];
  }
}

export class InvalidEventTypeError extends Error {
  constructor() {
    super('invalid event type');
  }
}

