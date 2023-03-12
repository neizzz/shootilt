/** Config */
export const ObjectSize = {
  AvoiderRadius: 6,
  BulletRadius: 6 /** NOTE: avoider 크기만큼 */,
  ChaserRadius: 6,
};

/** Enum(Kind) */
export enum EntityKind {
  NULL,
  Avoider,
  Chaser,
  Bullet,
}
export enum ComponentKind {
  NULL,
  PlayerTag,
  AvoiderTag,
  BulletTag,
  Position,
  Velocity,
  FutureVelocity,
  Chase,
  Collide,
  Rotate,
}
export enum TextureKind {
  AvoiderBody,
  AvoiderShadow,
  ChaserSpawningAnimation,
  ChaserBody,
  ChaserShadow,
  BulletLoadingAnimation,
  BulletBody,
  BulletTrail,
}

/** Enum(Behavior) */
export enum OutsideStageBehavior {
  Block,
  Remove,
}

/** Enum(State) */
export enum CommonState {
  NULL,
}
export enum AvoiderState {
  Spawning,
  Avoiding,
  Dead,
}
export enum ChaserState {
  Spawning,
  Chasing,
  Mutated,
  Dead,
}
export enum BulletState {
  Loading,
  Ready,
  Shooted,
}

