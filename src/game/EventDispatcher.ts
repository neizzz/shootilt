import Game from '@game';

import { StateComponent } from '@game/models/component';
import { Entity } from '@game/models/entity';
import { GameEvent } from '@game/models/event';

import EntityManager from './EntityManager';

/**
 * NOTE:
 * state pattern과의 연결고리, 다른 방법?
 */
export default class EventDispatcher {
  private _game: Game;
  private _entityManager: EntityManager;
  private _stateComponents: StateComponent[];

  constructor(
    game: Game,
    entityManager: EntityManager,
    stateComponents: StateComponent[]
  ) {
    this._game = game;
    this._entityManager = entityManager;
    this._stateComponents = stateComponents;
  }

  dispatch(event: GameEvent, entity: Entity) {
    if (event === GameEvent.Dead) {
      this._entityManager.removeEntity(entity);

      if (entity === this._entityManager.getPlayerEntity()) {
        this._game.endRound();
      }
    }

    console.info(`[EVENT: ${event}, ENTITY: ${entity}]`);

    const stateComponent = this._stateComponents[entity];
    stateComponent.state?.handleEvent(new CustomEvent(event));
  }
}

