export interface ISystem {
  destroy?: () => void;
  update: (delta: number, params?: any) => void;
}

