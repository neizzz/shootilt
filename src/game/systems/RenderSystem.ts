import { AbstractRenderer, Container, Graphics, Sprite } from 'pixi.js';

import Game from '@game';
import { AppearanceComponent, PositionComponent } from '@game/models/component';
import { Entity, EntityKind } from '@game/models/entity';
import { ISystem } from '@game/models/system';
import { SealedArray } from '@game/utils/container';

export default class RenderSystem implements ISystem {
  private _stage: Container;
  private _renderer: AbstractRenderer;
  private _positionComponents: PositionComponent[];
  private _appearanceComponents: AppearanceComponent[];
  private _spritePool = SealedArray.from<Sprite | undefined>({
    length: Game.MAX_ENTITY_COUNT,
  });

  private _createSprite: ReturnType<
    InstanceType<typeof RenderSystem>['_createSpriteCloser']
  >;

  constructor(
    stage: Container,
    renderer: AbstractRenderer,
    positionComponents: PositionComponent[],
    appearanceComponents: AppearanceComponent[]
  ) {
    this._stage = stage;
    this._renderer = renderer;
    this._positionComponents = positionComponents;
    this._appearanceComponents = appearanceComponents;
    this._createSprite = this._createSpriteCloser();
  }

  update() {
    // FIXME: 뭔가 깔끔하지 못함. sprite생명주기만 다루는 system이 필요한가?
    for (let entity = 0 as Entity; entity < Game.MAX_ENTITY_COUNT; entity++) {
      let sprite = this._spritePool[entity];

      if (!this._checkInUse(entity)) {
        sprite && this._stage.removeChild(sprite);
        continue;
      }

      const { kind } = this._appearanceComponents[entity];
      const { x, y } = this._positionComponents[entity];

      if (!sprite) {
        sprite = this._spritePool[entity] = this._createSprite(kind);
        this._stage.addChild(sprite);
      }

      sprite.x = x;
      sprite.y = y;
    }
  }

  private _checkInUse(entity: Entity) {
    return (
      this._appearanceComponents[entity].inUse &&
      this._positionComponents[entity].inUse
    );
  }

  private _createSpriteCloser() {
    const avoiderGraphics = new Graphics();
    avoiderGraphics.beginFill(0x495c83);
    avoiderGraphics.drawCircle(0, 0, 6);
    avoiderGraphics.endFill();
    avoiderGraphics.cacheAsBitmap = true;

    const trackerGraphics = new Graphics();
    trackerGraphics.beginFill(0xeb455f);
    trackerGraphics.drawCircle(0, 0, 8);
    trackerGraphics.endFill();
    trackerGraphics.cacheAsBitmap = true;

    return (entityKind: EntityKind) => {
      let graphics;

      switch (entityKind) {
        case EntityKind.Avoider: {
          graphics = avoiderGraphics;
          break;
        }

        case EntityKind.Tracker: {
          graphics = trackerGraphics;
          break;
        }

        default:
          throw new Error('unsupported entity kind');
      }

      const sprite = new Sprite(this._renderer.generateTexture(graphics));
      sprite.anchor.set(0.5);
      return sprite;
    };
  }
}

