import { Entity } from '@game/models/ecs';

export default class ElementByEntityMap<E extends { destroy?: () => void }> {
  private _m: Map<Entity, E>;

  constructor() {
    this._m = new Map<Entity, E>();
  }

  get(entity: Entity): E | undefined {
    return this._m.get(entity);
  }

  add(entity: Entity, element: E): void {
    this._m.set(entity, element);
  }

  remove(entity: Entity): void {
    this._m.get(entity)?.destroy?.();
    this._m.delete(entity);
  }
}

