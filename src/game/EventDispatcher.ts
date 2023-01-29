import { StateComponent } from '@game/models/component';
import { Entity } from '@game/models/entity';
import { GameEvent } from '@game/models/event';

import EntityManager from './EntityManager';

/**
 * NOTE:
 * state pattern과의 연결고리, 다른 방법?
 */
export default class EventDispatcher {
  private _entityManager: EntityManager;
  private _stateComponents: StateComponent[];

  constructor(entityManager: EntityManager, stateComponents: StateComponent[]) {
    this._entityManager = entityManager;
    this._stateComponents = stateComponents;
  }

  dispatch(event: GameEvent, entity: Entity) {
    if (event === GameEvent.Dead) {
      // console.log('dead entity:', entity);
      this._entityManager.removeEntity(entity);
    }

    const stateComponent = this._stateComponents[entity];
    stateComponent.state?.handleEvent(new CustomEvent(event));
  }
}

