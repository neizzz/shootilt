export interface IState {
  enter(...args: any): ThisType<IState>;
  destroy(): void;
  handleEvent(event: Event | CustomEvent): void;
}

export enum AvoiderState {
  Controlled = 'avoider-state/controlled',
}

export enum TrackerState {
  Spawning = 'tracker-state/spawning',
  Tracking = 'tracker-state/tracking',
  // TODO: Dead?
}

