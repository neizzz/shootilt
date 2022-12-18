import { EntityKind } from './entity';

export enum ComponentKind {
  Position = 'component/position',
  Velocity = 'component/velocity',
  Speed = 'component/speed',
  Appearance = 'component/appearance',
}

export type MappedComponentFromKind = {
  [ComponentKind.Position]: PositionComponent;
  [ComponentKind.Velocity]: VelocityComponent;
  [ComponentKind.Speed]: SpeedComponent;
  [ComponentKind.Appearance]: AppearanceComponent;
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

export type AppearanceComponent = IComponent & {
  kind: EntityKind;
  // TODO: state?
};

