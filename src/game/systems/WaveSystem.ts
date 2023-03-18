import * as Ecs from 'bitecs';

import { GameContext } from '@game';

import { ComponentKind } from '@game/models/constant';
import {
  ChaseStore,
  ISystem,
  PositionStore,
  PositionType,
} from '@game/models/ecs';
import { AvoiderTag } from '@game/models/ecs';

import { createChaser } from '@game/utils/create-entity';
import {
  createCircleWave,
  createStraightWave,
  createStraightWave2,
} from '@game/utils/create-wave';
import {
  centerPosition,
  oppositePositionFrom,
  randomPosition,
} from '@game/utils/in-game';
import { randomFlag, rangedRandomNumber } from '@game/utils/math';
import { now } from '@game/utils/time';

// TODO: FIXME: 이건 추후에, DifficultySystem으로 수정가능하게
const WAVE_INTERVAL = 5000;
const WAVE_AMOUNT_UNIT = 3;
const WAVE_MAX_AMOUNT_AT_ONCE = 24;
const CHASER_MAX_COUNT = 200;
const TOTAL_WAVE_KIND = 10;

const MINIMAL_TIME_INTERVAL = 40;

export default class WaveSystem implements ISystem {
  private _nextWaveTime: number;
  private _waveStage: number;

  private _queryChaser = Ecs.defineQuery([ChaseStore]);
  private _queryAvoider = Ecs.defineQuery([AvoiderTag]);

  // private _intervalHandlers = new Set<ReturnType<typeof setInterval>>();

  constructor(startTime: number) {
    this._nextWaveTime = startTime + WAVE_INTERVAL;
    this._waveStage = 1;
  }

  // destroy() {
  //   this._intervalHandlers.forEach((handler) => {
  //     clearInterval(handler);
  //   });
  // }

  update(world: Ecs.IWorld) {
    if (this._nextWaveTime > now()) return;

    const chasers = this._queryChaser(world);

    if (chasers.length > CHASER_MAX_COUNT) return;

    const currentAmount = Math.min(
      this._waveStage * WAVE_AMOUNT_UNIT,
      WAVE_MAX_AMOUNT_AT_ONCE
    );

    /** random creation */
    // for (let i = 0; i < currentAmount; i++) {
    //   createChaser(world, {
    //     [ComponentKind.Position]: randomPosition() as PositionType,
    //   });
    // }

    switch (this._waveStage % TOTAL_WAVE_KIND) {
      case 1:
      case 6:
        // const amount = 10 + Math.min(this._waveStage, 20);
        const amount = 10;
        const mutantSpeed = GameContext.CURRENT_CHASE_SPEED;
        createStraightWave(
          world,
          {
            amount,
            startPoint: {
              x: 0,
              y: 6,
            },
            endPoint: {
              x: GameContext.VIEW_WIDTH,
              y: 6,
            },
            timeInterval: 0,
          },
          { directionAngle: Math.PI, speed: mutantSpeed }
        );
        createStraightWave(
          world,
          {
            amount,
            startPoint: {
              x: GameContext.VIEW_WIDTH,
              y: GameContext.VIEW_HEIGHT - 6,
            },
            endPoint: {
              x: 0,
              y: GameContext.VIEW_HEIGHT - 6,
            },
            timeInterval: 0,
          },
          { directionAngle: 0, speed: mutantSpeed }
        );
        break;

      case 2:
      case 3: {
        const startPoint = randomPosition();
        createStraightWave(world, {
          amount: 10 + Math.min(20, Math.floor(this._waveStage / 3)),
          startPoint,
          endPoint: oppositePositionFrom(startPoint, {
            x: rangedRandomNumber(150, 400),
            y: rangedRandomNumber(150, 250),
          }),
          timeInterval: 100,
        });
        break;
      }

      case 4:
      case 5:
        [0, Math.PI / 2, Math.PI, Math.PI + Math.PI / 2].forEach((angle) => {
          createStraightWave2(world, {
            amount: 10 + Math.min(20, Math.floor(this._waveStage / 3)),
            startPoint: centerPosition(),
            angle,
            locationInterval: 8,
            timeInterval: 100,
          });
        });
        break;

      case 7:
      case 8:
        /** TODO: battle play */
        const avoider = this._queryAvoider(world)[0];
        createCircleWave(world, {
          amount: 30 + Math.min(Math.floor(this._waveStage / 5), 20),
          centerPoint: {
            x: PositionStore.x[avoider],
            y: PositionStore.y[avoider],
          },
          radius: Math.max(40, 200 - 5 * this._waveStage),
          timeInterval: 0,
        });
        break;
    }

    this._waveStage++;
    this._nextWaveTime = this._nextWaveTime + WAVE_INTERVAL;
  }
}

