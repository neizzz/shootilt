import { AnimatedSprite, Sprite, Texture } from 'pixi.js';

import { ComponentKind, VelocityComponent } from '@game/models/component';
import { Entity } from '@game/models/entity';
import { GameEvent } from '@game/models/event';

import HashSet from '@game/utils/container/HashSet';

import { AbstractState, InvalidUseError } from './common';

export enum BulletStateValue {
  Loading = 'bullet-state/loading',
  Ready = 'bullet-state/ready',
  Shooting = 'bullet-state/shooting',
}

abstract class BulletStateBase extends AbstractState {
  protected _enemyEntitySet!: HashSet<Entity>;

  /** FIXME: 뭔가 깔끔하지 않음. FSM전체를 따라 넘겨줘야됨. */
  setEnemyEntitySet(enemyEntitySet: HashSet<Entity>): this {
    this._enemyEntitySet = enemyEntitySet;
    return this;
  }
}

export class BulletLoadingState extends BulletStateBase {
  enter(): this {
    const assetBundle = this.getAssetBundle();
    const loadAnimationSprite = new AnimatedSprite(
      assetBundle['spawn-animation-texture'] as Texture[]
    );
    loadAnimationSprite.onComplete = () => {
      this.handleEvent(GameEvent.BulletLoadEnd);
    };
    loadAnimationSprite.play();
    loadAnimationSprite.loop = false;
    loadAnimationSprite.anchor.set(0.5);
    this._stateComponent.sprites = [loadAnimationSprite];
    this._stage.addChild(loadAnimationSprite);
    return this;
  }

  handleEvent(event: GameEvent) {
    switch (event) {
      case GameEvent.BulletLoadEnd: {
        this._stateComponent.state = new BulletReadyState(
          this._entity,
          this._componentPools,
          this._stage
        )
          .setEnemyEntitySet(this._enemyEntitySet)
          .enter();
      }
    }
  }

  valueOf() {
    return BulletStateValue.Loading;
  }
}

export class BulletReadyState extends BulletStateBase {
  enter(): this {
    const assetBundle = this.getAssetBundle();
    const bodySprite = new Sprite(assetBundle['body-texture'] as Texture);
    this._stateComponent.sprites = [bodySprite];
    return this;
  }

  handleEvent(event: GameEvent, params?: AnyObject) {
    switch (event) {
      case GameEvent.BulletShoot: {
        this._stateComponent.state = new BulletShootingState(
          this._entity,
          this._componentPools,
          this._stage
        )
          .setEnemyEntitySet(this._enemyEntitySet)
          .enter(params as Parameters<BulletShootingState['enter']>[0]);
      }
    }
  }

  valueOf() {
    return BulletStateValue.Ready;
  }
}

export class BulletShootingState extends BulletStateBase {
  enter(params: { velocityComponent: VelocityComponent }): this {
    if (!this._enemyEntitySet) throw new InvalidUseError();

    const inputVelocityComponent = params.velocityComponent;
    const velocityComponent =
      this._componentPools[ComponentKind.Velocity][this._entity];
    velocityComponent.inUse = true;
    velocityComponent.vx = inputVelocityComponent.vx;
    velocityComponent.vy = inputVelocityComponent.vy;

    const collideComponent =
      this._componentPools[ComponentKind.Collide][this._entity];
    const { width } = this._stateComponent.sprites[0].getBounds();
    collideComponent.inUse = true;
    collideComponent.distFromCenter = {
      x: 0,
      y: 0,
    };
    collideComponent.radius = width / 2;
    collideComponent.targetEntitiesRef = this._enemyEntitySet.keysRef();
    collideComponent.eventToTarget = GameEvent.Dead;
    return this;
  }

  valueOf() {
    return BulletStateValue.Shooting;
  }
}

