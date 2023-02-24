import AssetStore, { AssetBundle } from '@game/AssetStore';
import { Container } from 'pixi.js';

import { GameContext } from '@game';

import {
  ComponentKind,
  ComponentPools,
  StateComponent,
} from '@game/models/component';
import { Entity } from '@game/models/entity';
import { GameEvent } from '@game/models/event';
import { IState } from '@game/models/state';

/** 상태와 상태에 따른 Sprite 생명주기 관리 (update는 system에서 관리) */
export abstract class AbstractState implements IState {
  protected _entity: Entity;
  protected _stage: Container;
  protected _componentPools: ComponentPools;
  protected _stateComponent: StateComponent;
  protected _assetBundleKey?: string;
  private _assetStore: AssetStore;

  constructor(
    entity: Entity,
    componentPools: ComponentPools,
    stage: Container
  ) {
    this._entity = entity;
    this._stage = stage;
    this._componentPools = componentPools;
    this._stateComponent = this._componentPools[ComponentKind.State][entity];
    this._assetStore = GameContext.assetStore as AssetStore;
  }

  setAssetBundleKey(asssetBundleKey: string): this {
    this._assetBundleKey = asssetBundleKey;
    return this;
  }

  getAssetBundle(): AssetBundle {
    if (!this._assetBundleKey) throw new InvalidUseError();
    return this._assetStore.get(this._assetBundleKey) as AssetBundle;
  }

  enter(params?: AnyObject): this {
    new Error('abstract method');
    return this;
  }

  valueOf() {
    new Error('abstract method');
    return 'not reached';
  }

  handleEvent(event: GameEvent, params?: AnyObject): void {
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

export class InvalidUseError extends Error {
  constructor() {
    super('invalid use');
  }
}

export class InvalidEventTypeError extends Error {
  constructor() {
    super('invalid event type');
  }
}

