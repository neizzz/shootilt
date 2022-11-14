import { Sprite } from 'pixi.js';

export enum ComponentKind {
  Position = 'component/position',
  Velocity = 'component/velocity',
  Sprite = 'component/sprite',
}

export interface IComponent {
  inUse: boolean;
}

export type PositionComponent = IComponent & {
  x: number;
  y: number;
}

export type VelocityComponent = IComponent & {
  x: number;
  y: number;
}

export type SpriteComponent = IComponent & {
  sprite: Sprite; /** FIXME: pixi js로부터 격리 필요 */
};
