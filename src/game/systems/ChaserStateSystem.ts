import { Texture } from '@pixi/core';
import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { AnimatedSprite, Sprite } from 'pixi.js';

import * as Ecs from 'bitecs';

import {
  AvoiderState,
  ChaserState,
  EntityKind,
  ObjectSize,
  OutsideStageBehavior,
  TextureKind,
} from '@game/models/constant';
import {
  ChaseStore,
  ChaserTag,
  CollideStore,
  Entity,
  FutureVelocityStore,
  ISystem,
  OutsideStageBehaviorStore,
  PlayerTag,
  PositionStore,
  VelocityStore,
} from '@game/models/ecs';

import { increasingKeys } from '@game/utils/array';
import ElementByEntityMap from '@game/utils/container/ElementByEntityMap';
import {
  createAnimatedSprite,
  createSprite,
  generateTexture,
} from '@game/utils/in-game';

type ChaserTextureKind =
  | TextureKind.ChaserBody
  | TextureKind.ChaserShadow
  | TextureKind.ChaserSpawningAnimation;

export default class ChaserStateSystem implements ISystem {
  private _stage: Container;
  private _backStage: Container;

  private _textureByKind!: Record<ChaserTextureKind, Texture | Texture[]>;
  private _spriteByEntity = new ElementByEntityMap<Sprite | AnimatedSprite>();
  private _shadowSpriteByEntity = new ElementByEntityMap<Sprite>();

  /** TODO: battle play인 경우 target을 좀더 유연하게 세팅해야함 */
  private _queryPlayer = Ecs.defineQuery([PlayerTag]);

  private _queryChasers = Ecs.defineQuery([ChaserTag]);
  private _queryChangedChasers = Ecs.defineQuery([Ecs.Changed(ChaserTag)]);
  private _queryEnteredChasers = Ecs.enterQuery(this._queryChasers);
  private _queryExitedChasers = Ecs.exitQuery(this._queryChasers);

  constructor(stage: Container, backStage: Container) {
    this._stage = stage;
    this._backStage = backStage;
    this._initTextures();
  }

  destroy() {
    /** TODO: */
  }

  update(world: Ecs.IWorld) {
    this._queryEnteredChasers(world).forEach((chaser) => {
      const spawningSprite = createAnimatedSprite(
        this._textureByKind[TextureKind.ChaserSpawningAnimation] as Texture[],
        () => {
          if (ChaserTag.mutant[chaser]) {
            ChaserTag.state[chaser] = ChaserState.Mutated;
          } else {
            ChaserTag.state[chaser] = ChaserState.Chasing;
          }
        }
      );
      this._spriteByEntity.add(chaser as Entity, spawningSprite);
      this._stage.addChild(spawningSprite);
    });

    this._queryChangedChasers(world).forEach((chaser) => {
      switch (ChaserTag.state[chaser]) {
        // case ChaserState.Spawning:
        //   throw new Error('not reached');

        case ChaserState.Mutated:
          Ecs.addComponent(world, VelocityStore, chaser);
          Ecs.addComponent(world, OutsideStageBehaviorStore, chaser);
          VelocityStore.x[chaser] = FutureVelocityStore.x[chaser];
          VelocityStore.y[chaser] = FutureVelocityStore.y[chaser];
          OutsideStageBehaviorStore.behavior[chaser] =
            OutsideStageBehavior.Remove;
          Ecs.removeComponent(world, FutureVelocityStore, chaser);
          this._commonActivatedRoutine(world, chaser as Entity);
          break;

        case ChaserState.Chasing:
          Ecs.addComponent(world, ChaseStore, chaser);
          Ecs.addComponent(world, VelocityStore, chaser);
          /** TODO: battle play */
          ChaseStore.target[chaser] = this._queryPlayer(world)[0];
          VelocityStore.x[chaser] = 0;
          VelocityStore.y[chaser] = 0;
          this._commonActivatedRoutine(world, chaser as Entity);
          break;

        case ChaserState.Dead:
          Ecs.removeEntity(world, chaser);
          break;
      }
    });

    this._queryExitedChasers(world).forEach((chaser) => {
      this._spriteByEntity.remove(chaser as Entity);
      this._shadowSpriteByEntity.remove(chaser as Entity);
    });

    this._queryChasers(world).forEach((chaser) => {
      if (ChaserTag.state[chaser] === ChaserState.Dead) return;

      const [x, y] = [PositionStore.x[chaser], PositionStore.y[chaser]];
      const bodySprite = this._spriteByEntity.get(chaser as Entity) as Sprite;
      bodySprite.x = x;
      bodySprite.y = y;

      if (ChaserTag.state[chaser] === ChaserState.Spawning) return;

      const shadowSprite = this._shadowSpriteByEntity.get(
        chaser as Entity
      ) as Sprite;
      shadowSprite.scale = { x: 1.4, y: 1.4 };
      shadowSprite.x = x;
      shadowSprite.y = y;
    });
  }

  private _commonActivatedRoutine(world: Ecs.IWorld, chaser: Entity) {
    Ecs.addComponent(world, CollideStore, chaser);
    CollideStore.targetKind[chaser] = EntityKind.Avoider;
    CollideStore.hitRadius[chaser] = ObjectSize.ChaserRadius;
    CollideStore.hitStateToTarget[chaser] = AvoiderState.Dead;

    const bodySprite = createSprite(
      this._textureByKind[TextureKind.ChaserBody] as Texture
    );
    const shadowSprite = createSprite(
      this._textureByKind[TextureKind.ChaserShadow] as Texture
    );

    this._spriteByEntity.remove(chaser as Entity); // remove spawning sprite
    this._spriteByEntity.add(chaser as Entity, bodySprite);
    this._stage.addChild(bodySprite);

    this._shadowSpriteByEntity.add(chaser as Entity, shadowSprite);
    this._backStage.addChild(shadowSprite);
  }

  private _initTextures() {
    this._textureByKind = {
      [TextureKind.ChaserSpawningAnimation]: increasingKeys(60).map((num) => {
        const currentGraphics = new Graphics();
        currentGraphics.beginFill(0xeb455f);
        currentGraphics.drawCircle(0, 0, (ObjectSize.ChaserRadius * num) / 60);
        currentGraphics.endFill();
        currentGraphics.cacheAsBitmap = true;
        return generateTexture(currentGraphics);
      }),
      [TextureKind.ChaserBody]: (() => {
        const graphics = new Graphics()
          .beginFill(0xeb455f)
          .drawCircle(0, 0, ObjectSize.ChaserRadius)
          .endFill();
        graphics.cacheAsBitmap = true;
        return generateTexture(graphics);
      })(),
      [TextureKind.ChaserShadow]: (() => {
        const graphics = new Graphics()
          .beginFill(0xfcffe7)
          .drawCircle(0, 0, ObjectSize.ChaserRadius)
          .endFill();
        graphics.cacheAsBitmap = true;
        return generateTexture(graphics);
      })(),
    };
  }
}

