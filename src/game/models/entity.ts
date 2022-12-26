export type Entity = number & { entity: any };

export enum EntityKind {
  NULL = 'entity/null',
  Avoider = 'entity/avoider',
  Tracker = 'entity/tracker',
}

export type NonNullEntityKind = Exclude<EntityKind, EntityKind.NULL>;

