import { Sprite } from 'pixi.js';

import { IState } from './state';

export enum ComponentKind {
  Position = 'component/position',
  Velocity = 'component/velocity',
  Speed = 'component/speed',
  State = 'component/state',
}

export type MappedComponentFromKind = {
  [ComponentKind.Position]: PositionComponent;
  [ComponentKind.Velocity]: VelocityComponent;
  [ComponentKind.Speed]: SpeedComponent;
  [ComponentKind.State]: StateComponent;
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

export type StateComponent = IComponent & {
  state?: IState;
  sprites: Sprite[];
};

