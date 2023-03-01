import * as Ecs from 'bitecs';

import {
  AvoiderState,
  BulletState,
  ChaserState,
  ComponentKind,
  EntityKind,
  OutsideStageBehavior,
} from './constant';

/**
 * Types
 */
type State = AvoiderState | ChaserState | BulletState;

/**
 * Entity
 */
export type Entity = number & { entity: any };

/**
 * Component(Store)
 * ✅ if add new component, modify 'ComponentKind' enum in 'models/constant.ts'
 */
export type ComponentTypes = {
  [ComponentKind.AvoiderTag]?: AvoiderTagType;
  [ComponentKind.BulletTag]?: BulletTagType;
  [ComponentKind.Position]?: PositionType;
  [ComponentKind.Velocity]?: VelocityType;
  [ComponentKind.Chase]?: ChaseType;
  [ComponentKind.Collide]?: CollideType;
  [ComponentKind.Rotate]?: RotateType;
};

export const PlayerTag = Ecs.defineComponent();

export const AvoiderTag = Ecs.defineComponent({
  state: Ecs.Types.ui8,
});
export type AvoiderTagType = {
  state: AvoiderState;
};

export const EquippedBulletReference = Ecs.defineComponent({
  bullet: Ecs.Types.eid,
});
export type EquippedBulletReferenceType = {
  bullet: Entity;
};

export const BulletTag = Ecs.defineComponent({
  state: Ecs.Types.ui8,
  avoider: Ecs.Types.eid /** NOTE: 생성 이후로 안바뀜 */,
});
export type BulletTagType = {
  state: BulletState;
  avoider: Entity;
};

export const ChaserTag = Ecs.defineComponent({
  state: Ecs.Types.ui8,
});
export type ChaserTagType = {
  state: ChaserState;
};

export const PositionStore = Ecs.defineComponent({
  x: Ecs.Types.f32,
  y: Ecs.Types.f32,
});
export type PositionType = {
  x: number;
  y: number;
};

export const VelocityStore = Ecs.defineComponent({
  x: Ecs.Types.f32,
  y: Ecs.Types.f32,
});
export type VelocityType = {
  x: number;
  y: number;
};

export const OutsideStageBehaviorStore = Ecs.defineComponent({
  behavior: Ecs.Types.ui8,
});
export type OutsideStageBehaviorType = {
  behavior: OutsideStageBehavior;
};

export const ChaseStore = Ecs.defineComponent({ target: Ecs.Types.eid });
export type ChaseType = {
  target: Entity;
};

export const CollideStore = Ecs.defineComponent({
  targetEntityKind: Ecs.Types.ui8 /** TODO: list화 해야됨. 2~3개정도? */,
  hitStateToTarget: Ecs.Types.ui8 /** TODO: list화 해야됨. 2~3개정도? */,
  hitRadius: Ecs.Types.ui8,
});
export type CollideType = {
  targetEntityKind: EntityKind;
  hitStateToTarget: State;
  hitRadius: number;
};

export const RotateStore = Ecs.defineComponent({
  angle: Ecs.Types.ui8 /** clockwise radian from y axis */,
});
export type RotateType = {
  angle: number;
};

/**
 * System
 */
export interface ISystem {
  destroy?(): void;
  update(world: Ecs.IWorld, delta: number): void;
}

