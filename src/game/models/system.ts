export interface ISystem {
  destroy?: () => void;
  update: (params?: any) => void;
}
