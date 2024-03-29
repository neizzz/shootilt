import { Texture } from '@pixi/core';
import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { AnimatedSprite } from '@pixi/sprite-animated';
import { Sprite } from 'pixi.js';

import * as Ecs from 'bitecs';

import {
  AvoiderState,
  CommonState,
  EntityKind,
  ObjectSize,
  TextureKind,
} from '@game/models/constant';
import {
  AvoiderTag,
  CollideStore,
  Entity,
  ISystem,
  PositionStore,
  VelocityStore,
} from '@game/models/ecs';

import ElementByEntityMap from '@game/utils/container/ElementByEntityMap';
import { createSprite, generateTexture } from '@game/utils/in-game';

import { EquippedBulletReference } from './../models/ecs';

type AvoiderTextureKind = TextureKind.AvoiderBody | TextureKind.AvoiderShadow;

export default class AvoiderStateSystem implements ISystem {
  private _mainStage: Container;
  private _backStage: Container;

  private _textureByKind!: Record<AvoiderTextureKind, Texture | Texture[]>;
  private _spriteByEntity = new ElementByEntityMap<Sprite | AnimatedSprite>();
  private _shadowSpriteByEntity = new ElementByEntityMap<Sprite>();

  private _queryAvoiders = Ecs.defineQuery([AvoiderTag]);
  private _queryChangedAvoiders = Ecs.defineQuery([Ecs.Changed(AvoiderTag)]);
  private _queryEnteredAvoiders = Ecs.enterQuery(this._queryAvoiders);
  private _queryExitedAvoiders = Ecs.exitQuery(this._queryAvoiders);

  constructor(mainStage: Container, backStage: Container) {
    this._mainStage = mainStage;
    this._backStage = backStage;
    this._initTextures();
  }

  destroy() {
    /** TODO: */
  }

  update(world: Ecs.IWorld) {
    this._queryEnteredAvoiders(world).forEach((avoider) => {
      const bodySprite = createSprite(
        this._textureByKind[TextureKind.AvoiderBody] as Texture
      );
      this._spriteByEntity.add(avoider as Entity, bodySprite);
      this._mainStage.addChild(bodySprite);
    });

    this._queryChangedAvoiders(world).forEach((avoider) => {
      switch (AvoiderTag.state[avoider]) {
        case AvoiderState.Spawning:
          throw new Error('not reached');

        case AvoiderState.Avoiding:
          const bullet = EquippedBulletReference.bullet[avoider];
          Ecs.addComponent(world, VelocityStore, bullet);
          VelocityStore.x[bullet] = 0;
          VelocityStore.y[bullet] = 0;

          Ecs.addComponent(world, VelocityStore, avoider);
          VelocityStore.x[avoider] = 0;
          VelocityStore.y[avoider] = 0;

          Ecs.addComponent(world, CollideStore, avoider);
          CollideStore.targetKind[avoider] = EntityKind.NULL;
          CollideStore.hitRadius[avoider] = ObjectSize.AvoiderRadius;
          CollideStore.hitStateToTarget[avoider] = CommonState.NULL;

          const shadowSprite = createSprite(
            this._textureByKind[TextureKind.AvoiderShadow] as Texture
          );
          shadowSprite.scale = { x: 1.3, y: 1.3 };
          this._backStage.addChild(shadowSprite);

          this._shadowSpriteByEntity.add(avoider as Entity, shadowSprite);
          break;

        case AvoiderState.Dead:
          Ecs.removeEntity(world, avoider);
          break;
      }
    });

    this._queryExitedAvoiders(world).forEach((avoider) => {
      this._spriteByEntity.remove(avoider as Entity);
      this._shadowSpriteByEntity.remove(avoider as Entity);
    });

    this._queryAvoiders(world).forEach((avoider) => {
      const [x, y] = [PositionStore.x[avoider], PositionStore.y[avoider]];

      const bodySprite = this._spriteByEntity.get(avoider as Entity) as Sprite;
      bodySprite.x = x;
      bodySprite.y = y;

      if (AvoiderTag.state[avoider] === AvoiderState.Spawning) return;

      const shadowSprite = this._shadowSpriteByEntity.get(
        avoider as Entity
      ) as Sprite;
      shadowSprite.x = x;
      shadowSprite.y = y;
    });
  }

  private _initTextures() {
    this._textureByKind = {
      [TextureKind.AvoiderBody]: (() => {
        const graphics = new Graphics()
          .beginFill(0x6eccaf)
          .drawCircle(0, 0, ObjectSize.AvoiderRadius)
          .endFill();
        graphics.cacheAsBitmap = true;
        return generateTexture(graphics);
      })(),
      [TextureKind.AvoiderShadow]: (() => {
        const graphics = new Graphics()
          .beginFill(0xfcffe7)
          // .drawCircle(0, 0, ObjectSize.AvoiderRadius + 2)
          .drawCircle(0, 0, ObjectSize.AvoiderRadius)
          .endFill();
        graphics.cacheAsBitmap = true;
        return generateTexture(graphics);
      })(),
    };
  }
}

