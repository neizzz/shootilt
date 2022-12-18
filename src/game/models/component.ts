export enum ComponentKind {
  Position = 'component/position',
  Velocity = 'component/velocity',
  Speed = 'component/speed',
  Sprite = 'component/sprite',
}

export type MappedComponentFromKind = {
  [ComponentKind.Position]: PositionComponent;
  [ComponentKind.Velocity]: VelocityComponent;
  [ComponentKind.Speed]: SpeedComponent;
};

export interface IComponent {
  inUse: boolean;
}

export type PositionComponent = IComponent & {
  x: number;
  y: number;
};

export type VelocityComponent = IComponent & {
  x: number;
  y: number;
};

export type SpeedComponent = IComponent & {
  speed: number;
};

/**
 * STATE
 * normal
 *
 *
 * TODO:
 * frozen
 * burned
 *
 */
