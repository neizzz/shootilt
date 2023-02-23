export interface IState {
  enter(): ThisType<this>;
  valueOf?: () => string;
  destroy(): void;
  handleEvent(event: Event | CustomEvent): void;
}

