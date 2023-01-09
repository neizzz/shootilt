import Game, { GameContext } from '@game';

import { ComponentKind, PartialComponents } from '@game/models/component';
import { Entity, EntityKind } from '@game/models/entity';

import { AvoiderControlledState } from '@game/states/avoider';
import { BulletShootingState } from '@game/states/bullet';
import { TrackerTrackingState } from '@game/states/tracker';
import { TrackerSpawningState } from '@game/states/tracker';

import { increasingKeys } from '@game/utils/array';
import { CircularQueue } from '@game/utils/container';

import { VelocityComponent } from './models/component';

export default class EntityManager {
  private _game: Game;
  private _idleEntityQueue = new CircularQueue<Entity>(
    GameContext.MAX_ENTITY_COUNT + 1
  );

  /** FIXME: */
  private _trackerCount = 0;

  constructor(game: Game) {
    this._game = game;
    increasingKeys(GameContext.MAX_ENTITY_COUNT).forEach((num) =>
      this._idleEntityQueue.push(num as Entity)
    );
  }

  /** FIXME: */
  getTrackerCount(): number {
    return this._trackerCount;
  }

  createEntity(kind: EntityKind, initComponents?: PartialComponents): Entity {
    const newEntity = this._nextIdleEntity();
    const componentPools = this._game.getComponentPools();

    switch (kind) {
      case EntityKind.Avoider: {
        const positionComponent =
          componentPools[ComponentKind.Position][newEntity];
        positionComponent.inUse = true;
        positionComponent.x = GameContext.VIEW_WIDTH / 2;
        positionComponent.y = GameContext.VIEW_HEIGHT / 2;
        positionComponent.removeIfOutside = false;

        const velocityComponent =
          componentPools[ComponentKind.Velocity][newEntity];
        velocityComponent.inUse = true;
        velocityComponent.x = 0;
        velocityComponent.y = 0;

        const stateComponent = componentPools[ComponentKind.State][newEntity];
        stateComponent.inUse = true;
        stateComponent.state = new AvoiderControlledState(
          this._game.getGameStage(),
          this._game.getTextureMap(EntityKind.Avoider),
          stateComponent
        ).enter();
        break;
      }

      case EntityKind.Tracker: {
        const positionComponent =
          componentPools[ComponentKind.Position][newEntity];
        positionComponent.inUse = true;
        positionComponent.x = initComponents![ComponentKind.Position]!.x!;
        positionComponent.y = initComponents![ComponentKind.Position]!.y!;
        positionComponent.removeIfOutside = false;

        const speedComponent = componentPools[ComponentKind.Speed][newEntity];
        speedComponent.inUse = true;
        speedComponent.speed = 1;

        const stateComponent = componentPools[ComponentKind.State][newEntity];
        stateComponent.inUse = true;
        stateComponent.state = new TrackerSpawningState(
          this._game.getGameStage(),
          this._game.getTextureMap(EntityKind.Tracker),
          stateComponent
        ).enter();
        break;
      }

      case EntityKind.Bullet: {
        const positionComponent =
          componentPools[ComponentKind.Position][newEntity];
        positionComponent.inUse = true;
        positionComponent.x = initComponents![ComponentKind.Position]!.x!;
        positionComponent.y = initComponents![ComponentKind.Position]!.y!;
        positionComponent.removeIfOutside = true;

        const velocityComponent =
          componentPools[ComponentKind.Velocity][newEntity];
        velocityComponent.inUse = true;
        velocityComponent.x = initComponents![ComponentKind.Velocity]!.x!;
        velocityComponent.y = initComponents![ComponentKind.Velocity]!.y!;

        // TODO: collide

        const stateComponent = componentPools[ComponentKind.State][newEntity];
        stateComponent.inUse = true;
        stateComponent.rotation =
          initComponents![ComponentKind.State]!.rotation!;
        stateComponent.state = (
          initComponents![ComponentKind.State]!.state! as BulletShootingState
        )
          .setStateComponent(stateComponent)
          .enter();
        break;
      }

      default:
        throw new Error('unknown entity kind');
    }

    /** FIXME: */
    if ((kind = EntityKind.Tracker)) {
      this._trackerCount++;
    }
    return newEntity as Entity;
  }

  removeEntity(entity: Entity): void {
    const componentPools = this._game.getComponentPools();

    Object.values(componentPools).forEach((componentPool) => {
      componentPool[entity].inUse = false;
    });

    const stateComponent = componentPools[ComponentKind.State][entity];

    /** FIXME: */
    if (stateComponent.state instanceof TrackerTrackingState) {
      this._trackerCount--;
    }

    stateComponent.state?.destroy();
    stateComponent.state = undefined;
    this._returnEntity(entity);
  }

  private _nextIdleEntity(): Entity {
    return this._idleEntityQueue.pop();
  }

  private _returnEntity(entity: Entity): void {
    return this._idleEntityQueue.push(entity);
  }
}

