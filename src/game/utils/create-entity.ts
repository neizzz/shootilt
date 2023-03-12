import * as Ecs from 'bitecs';

import {
  AvoiderState,
  BulletState,
  ChaserState,
  ComponentKind,
} from '@game/models/constant';
import {
  AvoiderTag,
  BulletTag,
  ChaserTag,
  ComponentTypes,
  Entity,
  EquippedBulletReference,
  PlayerTag,
  PositionStore,
  VelocityStore,
  VelocityType,
} from '@game/models/ecs';

import { FutureVelocityStore } from './../models/ecs';

export const createAvoider = (
  world: Ecs.IWorld,
  components: WithRequiredProperty<ComponentTypes, ComponentKind.Position>,
  isPlayer = true
): Entity => {
  const entity = Ecs.addEntity(world) as Entity;
  isPlayer && Ecs.addComponent(world, PlayerTag, entity);
  Ecs.addComponent(world, AvoiderTag, entity);
  Ecs.addComponent(world, EquippedBulletReference, entity);
  Ecs.addComponent(world, PositionStore, entity);
  AvoiderTag.state[entity] = AvoiderState.Spawning;
  PositionStore.x[entity] = components[ComponentKind.Position].x;
  PositionStore.y[entity] = components[ComponentKind.Position].y;
  EquippedBulletReference.bullet[entity] = createBullet(world, entity);
  console.debug('create avoider:', entity);
  return entity;
};

export const createChaser = (
  world: Ecs.IWorld,
  components: WithRequiredProperty<ComponentTypes, ComponentKind.Position>,
  mutant = false
): Entity => {
  const entity = Ecs.addEntity(world) as Entity;
  Ecs.addComponent(world, ChaserTag, entity);
  Ecs.addComponent(world, PositionStore, entity);
  ChaserTag.state[entity] = ChaserState.Spawning;
  ChaserTag.mutant[entity] = mutant as unknown as number;
  PositionStore.x[entity] = components[ComponentKind.Position].x;
  PositionStore.y[entity] = components[ComponentKind.Position].y;

  if (mutant) {
    Ecs.addComponent(world, FutureVelocityStore, entity);
    FutureVelocityStore.x[entity] = (
      components[ComponentKind.FutureVelocity] as VelocityType
    ).x;
    FutureVelocityStore.y[entity] = (
      components[ComponentKind.FutureVelocity] as VelocityType
    ).y;
  }
  console.debug('create chaser:', entity);
  return entity;
};

export const createBullet = (world: Ecs.IWorld, avoider: Entity): Entity => {
  const entity = Ecs.addEntity(world) as Entity;
  Ecs.addComponent(world, BulletTag, entity);
  Ecs.addComponent(world, PositionStore, entity);
  BulletTag.state[entity] = BulletState.Loading;
  BulletTag.avoider[entity] = avoider;
  PositionStore.x[entity] = PositionStore.x[avoider];
  PositionStore.y[entity] = PositionStore.y[avoider];
  if (Ecs.hasComponent(world, VelocityStore, avoider)) {
    console.debug('create start bullet');
    Ecs.addComponent(world, VelocityStore, entity);
    VelocityStore.x[entity] = VelocityStore.x[avoider];
    VelocityStore.y[entity] = VelocityStore.y[avoider];
  }
  console.debug('create bullet:', entity);
  return entity;
};

