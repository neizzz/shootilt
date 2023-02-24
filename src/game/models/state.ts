import { GameEvent } from './event';

export interface IState {
  enter(params?: AnyObject): this;
  valueOf: () => string;
  destroy(): void;
  handleEvent(event: GameEvent, params?: AnyObject): void;
}

