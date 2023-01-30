import { Container, Graphics, Sprite, Texture } from 'pixi.js';

import { GameContext } from '@game';

import { CollideComponent, PositionComponent } from '@game/models/component';
import { Entity } from '@game/models/entity';
import { ISystem } from '@game/models/system';

import { generateTexture } from '@game/utils/in-game';

export default class DebugCollideAreaViewSystem implements ISystem {
  private _stage: Container;
  private _collideComponents: CollideComponent[];
  private _positionComponents: PositionComponent[];
  private _debugSprites = Array.from<Sprite | undefined>({
    length: GameContext.MAX_ENTITY_COUNT, // 일단은 entity:debugSprite = 1:1로 가정
  });
  private _debugTextureMap = {} as Record<number, Texture>;

  constructor(
    stage: Container,
    collideComponents: CollideComponent[],
    positionComponents: PositionComponent[]
  ) {
    this._stage = stage;
    this._collideComponents = collideComponents;
    this._positionComponents = positionComponents;
  }

  update() {
    for (
      let entity = 0 as Entity;
      entity < GameContext.MAX_ENTITY_COUNT;
      entity++
    ) {
      if (!this._checkInUse(entity)) continue;

      const collide = this._collideComponents[entity];
      const position = this._positionComponents[entity];
      const sprite = this._debugSprites[entity];

      sprite!.x = position.x + collide.distFromCenter.x;
      sprite!.y = position.y + collide.distFromCenter.y;
    }
  }

  private _checkInUse(entity: number) {
    const collide = this._collideComponents[entity];

    if (collide.inUse) {
      if (!this._debugSprites[entity]) {
        const sprite = new Sprite(this._getDebugCircleTexture(collide.radius));
        sprite.anchor.set(0.5);
        sprite.zIndex = 9999;
        this._stage.addChild(sprite);
        this._debugSprites[entity] = sprite;
      }

      return true;
    }

    if (this._debugSprites[entity]) {
      this._debugSprites[entity]!.destroy();
      this._debugSprites[entity] = undefined;
    }

    return false;
  }

  private _getDebugCircleTexture(radius: number) {
    if (this._debugTextureMap[radius]) {
      return this._debugTextureMap[radius];
    } else {
      return (this._debugTextureMap[radius] = generateTexture(
        new Graphics()
          .beginFill(0x000000, 0.5)
          .drawCircle(0, 0, radius)
          .endFill()
      ));
    }
  }
}

