import { Sprite } from 'pixi.js';

export enum ComponentKind {
  Position = 'component/position',
  Velocity = 'component/velocity',
  Sprite = 'component/sprite',
  Speed = 'component/speed',
}

export type MappedComponentFromKind = {
  [ComponentKind.Position]: PositionComponent;
  [ComponentKind.Velocity]: VelocityComponent;
  [ComponentKind.Sprite]: SpriteComponent;
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

export type SpriteComponent = IComponent & {
  sprite: Sprite /** FIXME: pixi js로부터 격리 필요 */;
};

