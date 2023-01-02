export type Entity = number & { entity: any };

export enum EntityKind {
  NULL = 'entity/null',
  Avoider = 'entity/avoider',
  Tracker = 'entity/tracker',
  BasicBullet = 'entity/basic-bullet',
  FireBullet = 'entity/fire-bullet',
  IceBullet = 'entity/ice-bullet',
}

export type Bullet =
  | EntityKind.BasicBullet
  | EntityKind.FireBullet
  | EntityKind.IceBullet;

