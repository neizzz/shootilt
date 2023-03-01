import { Texture } from '@pixi/core';
import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { AnimatedSprite } from '@pixi/sprite-animated';
import * as Ecs from 'bitecs';
import { ParticleContainer, Sprite } from 'pixi.js';

import {
  AvoiderState,
  BulletState,
  ObjectSize,
  TextureKind,
} from '@game/models/constant';
import {
  AvoiderTag,
  BulletTag,
  Entity,
  ISystem,
  PositionStore,
} from '@game/models/ecs';

import TrailEffectSystem from '@game/systems/TrailEffectSystem';

import { increasingKeys } from '@game/utils/array';
import ElementByEntityMap from '@game/utils/container/ElementByEntityMap';
import {
  createAnimatedSprite,
  createSprite,
  generateTexture,
} from '@game/utils/in-game';

type BulletTextureKind =
  | TextureKind.BulletLoadingAnimation
  | TextureKind.BulletBody;

export default class BulletStateSystem implements ISystem {
  private _stage: Container;
  private _particleContainer: ParticleContainer;

  private _textureByKind!: Record<BulletTextureKind, Texture | Texture[]>;
  private _spriteByBullet = new ElementByEntityMap<Sprite | AnimatedSprite>();
  private _trailByBullet = {} as Record<Entity, TrailEffectSystem>;

  private _queryBullets = Ecs.defineQuery([BulletTag]);
  private _queryChangedBullets = Ecs.defineQuery([Ecs.Changed(BulletTag)]);
  private _queryEnteredBullets = Ecs.enterQuery(this._queryBullets);
  private _queryExitedBullets = Ecs.exitQuery(this._queryBullets);

  constructor(stage: Container, particleContainer: ParticleContainer) {
    this._stage = stage;
    this._particleContainer = particleContainer;
    this._initTextures();
  }

  destroy() {
    /** TODO:
     * textureByKind
     * spriteByBullet
     * trailByBullet
     */
  }

  update(world: Ecs.IWorld) {
    this._queryEnteredBullets(world).forEach((bullet) => {
      const loadingSprite = createAnimatedSprite(
        this._textureByKind[TextureKind.BulletLoadingAnimation] as Texture[],
        () => {
          BulletTag.state[bullet] = BulletState.Ready;
          const ownerAvoider = BulletTag.avoider[bullet];
          if (AvoiderTag.state[ownerAvoider] === AvoiderState.Spawning) {
            AvoiderTag.state[ownerAvoider] = AvoiderState.Avoiding;
          }
        }
      );
      this._spriteByBullet.add(bullet as Entity, loadingSprite);
      this._stage.addChild(loadingSprite);
    });

    this._queryChangedBullets(world).forEach((bullet) => {
      switch (BulletTag.state[bullet]) {
        case BulletState.Loading:
          throw new Error('not reached');

        case BulletState.Ready:
          const bodySprite = createSprite(
            this._textureByKind[TextureKind.BulletBody] as Texture
          );

          this._spriteByBullet.remove(bullet as Entity);
          this._spriteByBullet.add(bullet as Entity, bodySprite);
          this._stage.addChild(bodySprite);

          const trailEffectSystem = new TrailEffectSystem(
            bullet as Entity,
            this._textureByKind[TextureKind.BulletBody] as Texture,
            this._particleContainer
          );
          trailEffectSystem.update();
          this._trailByBullet[bullet as Entity] = trailEffectSystem;
          break;

        case BulletState.Shooted:
          /** TODO: Collide setting */
          break;
      }
    });

    this._queryExitedBullets(world).forEach((bullet) => {
      this._spriteByBullet.remove(bullet as Entity);
      this._trailByBullet[bullet as Entity].destroy();
      delete this._trailByBullet[bullet as Entity];
    });

    this._queryBullets(world).forEach((bullet) => {
      const bodySprite = this._spriteByBullet.get(bullet as Entity) as Sprite;

      const [x, y] = [PositionStore.x[bullet], PositionStore.y[bullet]];

      bodySprite.x = x;
      bodySprite.y = y;

      if (BulletTag.state[bullet] !== BulletState.Loading) {
        this._trailByBullet[bullet as Entity].update();
      }
    });
  }

  private _initTextures() {
    this._textureByKind = {
      [TextureKind.BulletLoadingAnimation]: increasingKeys(60).map((num) => {
        const currentGraphics = new Graphics();
        currentGraphics.beginFill(0x68b984);
        currentGraphics.drawCircle(0, 0, (ObjectSize.ChaserRadius * num) / 60);
        currentGraphics.endFill();
        currentGraphics.cacheAsBitmap = true;
        return generateTexture(currentGraphics);
      }),
      [TextureKind.BulletBody]: (() => {
        const graphics = new Graphics()
          .beginFill(0x68b984)
          .drawCircle(0, 0, ObjectSize.BulletRadius)
          .endFill();
        graphics.cacheAsBitmap = true;
        return generateTexture(graphics);
      })(),
    };
  }
}

