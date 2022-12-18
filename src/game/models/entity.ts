export type Entity = number & { entity: any };

export enum EntityKind {
  Avoider = 'entity/avoider',
  Tracker = 'entity/tracker',
}
