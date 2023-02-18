import { Sprite } from 'pixi.js';

import { Entity } from './entity';
import { GameEvent } from './event';
import { IState } from './state';

export enum ComponentKind {
  Position = 'component/position',
  Velocity = 'component/velocity',
  Speed = 'component/speed',
  State = 'component/state',
  Collide = 'component/collide',
}

type MappedComponentFromKind = {
  [ComponentKind.Position]: PositionComponent;
  [ComponentKind.Velocity]: VelocityComponent;
  [ComponentKind.State]: StateComponent;
  [ComponentKind.Collide]: CollideComponent;
};

export type ComponentPools = {
  [ComponentKind.Position]: PositionComponent[];
  [ComponentKind.Velocity]: VelocityComponent[];
  [ComponentKind.State]: StateComponent[];
  [ComponentKind.Collide]: CollideComponent[];
};

export type PartialComponents = {
  [key in keyof MappedComponentFromKind]?: Partial<
    MappedComponentFromKind[key]
  >;
};

export interface IComponent {
  inUse: boolean;
}

export type PositionComponent = IComponent & {
  x: number;
  y: number;
  outsideStageBehavior: 'none' | 'remove' | 'block';
};

export type VelocityComponent = IComponent & {
  vx: number;
  vy: number;
};

export type StateComponent = IComponent & {
  state?: IState;
  rotation: number;
  sprites: Sprite[];
};

export type CollideComponent = IComponent & {
  distFromCenter: SimplePoint /** relative center point from the pivot sprite's center */;
  radius: number;
  targetEntitiesRef?: CachedKeysRef<Entity> /** 단방향 */;
  eventToTarget?: GameEvent;
};

