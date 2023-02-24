import Game from '@game';

import { StateComponent } from '@game/models/component';
import { Entity } from '@game/models/entity';
import { GameEvent } from '@game/models/event';

import EntityManager from './EntityManager';

export type EventBusCallback = (params?: any) => void;

/**
 * NOTE:
 * system, state pattern과의 연결고리, 다른 방법?
 */
export default class EventBus {
  private _game: Game;
  private _entityManager: EntityManager;
  private _stateComponents: StateComponent[];

  private _subscribers = {} as Partial<{
    [key in GameEvent]: EventBusCallback[];
  }>;

  constructor(
    game: Game,
    entityManager: EntityManager,
    stateComponents: StateComponent[]
  ) {
    this._game = game;
    this._entityManager = entityManager;
    this._stateComponents = stateComponents;
  }

  dispatchToEntity(event: GameEvent, entity: Entity, params?: AnyObject): void {
    console.debug(`[EVENT: ${event}, ENTITY: ${entity}]`);

    const stateComponent = this._stateComponents[entity];
    stateComponent.state?.handleEvent(event, params);

    this.dispatch(event, { stateValue: this._stateValueFromEntity(entity) });

    /** FIXME: ad-hoc process */
    if (event === GameEvent.Dead) {
      if (entity === this._entityManager.getPlayerEntity()) {
        this._game.endRound();
      } else {
        this._entityManager.removeEntity(entity);
      }
    }
  }

  dispatch(event: GameEvent, params?: AnyObject): void {
    this._subscribers[event]?.forEach((callback) => callback(params));
  }

  register(event: GameEvent, callback: EventBusCallback): void {
    this._subscribers[event] ?? (this._subscribers[event] = []);

    if (this._subscribers[event]!.includes(callback)) {
      console.warn(
        `[EVENT: ${event}, CALLBACK: ${callback}] already registered.`
      );
      return;
    }

    this._subscribers[event]!.push(callback);
  }

  unregister(event: GameEvent, callback: EventBusCallback): void {
    const index = this._subscribers[event]?.findIndex(callback);

    if (index) {
      this._subscribers[event]?.splice(index, 1);
    } else {
      console.warn(
        `[EVENT: ${event}, CALLBACK: ${callback}] try to unregister a callback unregistered.`
      );
    }
  }

  private _stateValueFromEntity(entity: Entity): undefined | string {
    return this._stateComponents[entity].state?.valueOf?.();
  }
}

