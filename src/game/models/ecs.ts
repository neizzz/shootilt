import * as Ecs from 'bitecs';

import {
  AvoiderState,
  BulletState,
  ChaserState,
  CommonState,
  ComponentKind,
  EntityKind,
  OutsideStageBehavior,
} from './constant';

/**
 * Types
 */
type State = CommonState | AvoiderState | ChaserState | BulletState;

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
  [ComponentKind.FutureVelocity]?: VelocityType;
  [ComponentKind.Chase]?: ChaseType;
  [ComponentKind.Collide]?: CollideType;
  // [ComponentKind.Rotate]?: RotateType;
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
  mutant: Ecs.Types.ui8,
});
export type ChaserTagType = {
  state: ChaserState;
  mutant: boolean;
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
export const FutureVelocityStore = Ecs.defineComponent({
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

export const ChaseStore = Ecs.defineComponent({
  target: Ecs.Types.eid,
  speed: Ecs.Types.ui8,
});
export type ChaseType = {
  target: Entity;
  speed: number;
};

export const CollideStore = Ecs.defineComponent({
  targetKind: Ecs.Types.ui8 /** TODO: list화 해야됨. 3개 정도 */,
  hitStateToTarget: Ecs.Types.ui8 /** TODO: list화 해야됨. 3개 정도 */,
  hitRadius: Ecs.Types.ui8,
});
export type CollideType = {
  targetKind: EntityKind;
  hitStateToTarget: State;
  hitRadius: number;
};

// export const RotateStore = Ecs.defineComponent({
//   angle: Ecs.Types.ui8 /** clockwise radian from y axis */,
// });
// export type RotateType = {
//   angle: number;
// };

/**
 * System
 */
export interface ISystem {
  destroy?(world?: Ecs.IWorld): void;
  update(world: Ecs.IWorld, delta: number): void;
}

