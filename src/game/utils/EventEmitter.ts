/** WIP */

type EventMap = Record<string, any>;

type EventKey<T extends EventMap> = keyof T;
type EventHandler<P> = (params: P) => void;

export class EventEmitter<T extends EventMap> {
  private _handlersMap: { [K in EventKey<T>]?: EventHandler<T[K]>[] } = {};

  on<K extends EventKey<T>>(eventName: K, fn: EventHandler<T[K]>) {
    this._handlersMap[eventName]?.push(fn);
  }
  off<K extends EventKey<T>>(eventName: K, fn: EventHandler<T[K]>) {}
  emit<K extends EventKey<T>>(eventName: K, params: T[K]) {}
}
