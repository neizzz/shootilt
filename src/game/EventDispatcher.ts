import { StateComponent } from '@game/models/component';
import { Entity } from '@game/models/entity';
import { GameEvent } from '@game/models/event';

export default class EventDispatcher {
  private _stateComponents: StateComponent[];

  constructor(stateComponents: StateComponent[]) {
    this._stateComponents = stateComponents;
  }

  dispatchToEntity(entity: Entity, event: GameEvent) {
    const stateComponent = this._stateComponents[entity];

    if (!stateComponent.inUse) {
      return;
    }

    stateComponent.state?.handleEvent(new CustomEvent(event));
  }
}

