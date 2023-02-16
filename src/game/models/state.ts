export interface IState {
  enter(): IState;
  valueOf?: () => string;
  destroy(): void;
  handleEvent(event: Event | CustomEvent): void;
}

