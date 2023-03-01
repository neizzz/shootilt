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
  PlayerTag,
  PositionStore,
  VelocityStore,
} from '@game/models/ecs';

export const createAvoider = (
  world: Ecs.IWorld,
  components: WithRequiredProperty<ComponentTypes, ComponentKind.Position>,
  isPlayer = true
): Entity => {
  const entity = Ecs.addEntity(world) as Entity;
  isPlayer && Ecs.addComponent(world, PlayerTag, entity);
  Ecs.addComponent(world, AvoiderTag, entity);
  Ecs.addComponent(world, PositionStore, entity);
  AvoiderTag.state[entity] = AvoiderState.Spawning;
  AvoiderTag.bullet[entity] = createBullet(world, components);
  PositionStore.x[entity] = components[ComponentKind.Position].x;
  PositionStore.y[entity] = components[ComponentKind.Position].y;
  console.debug('create avoider:', entity);
  return entity;
};

export const createChaser = (
  world: Ecs.IWorld,
  components: WithRequiredProperty<ComponentTypes, ComponentKind.Position>
): Entity => {
  const entity = Ecs.addEntity(world) as Entity;
  Ecs.addComponent(world, ChaserTag, entity);
  Ecs.addComponent(world, PositionStore, entity);
  ChaserTag.state[entity] = ChaserState.Spawning;
  PositionStore.x[entity] = components[ComponentKind.Position].x;
  PositionStore.y[entity] = components[ComponentKind.Position].y;
  console.debug('create chaser:', entity);
  return entity;
};

export const createBullet = (
  world: Ecs.IWorld,
  components: WithRequiredProperty<ComponentTypes, ComponentKind.Position>
): Entity => {
  const entity = Ecs.addEntity(world) as Entity;
  Ecs.addComponent(world, BulletTag, entity);
  Ecs.addComponent(world, PositionStore, entity);
  Ecs.addComponent(world, VelocityStore, entity);
  BulletTag.state[entity] = BulletState.Loading;
  PositionStore.x[entity] = components[ComponentKind.Position].x;
  PositionStore.y[entity] = components[ComponentKind.Position].y;
  VelocityStore.x[entity] = 0;
  VelocityStore.y[entity] = 0;
  console.debug('create bullet:', entity);
  return entity;
};

