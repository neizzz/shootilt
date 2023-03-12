import * as Ecs from 'bitecs';

import Game, { GameContext } from '@game';

import { ComponentKind } from '@game/models/constant';
import { ChaseStore, ISystem, PositionType } from '@game/models/ecs';

import { createChaser } from '@game/utils/create-entity';
import { oppositePositionFrom, randomPosition } from '@game/utils/in-game';
import { rangedRandomNumber } from '@game/utils/math';
import { now } from '@game/utils/time';

// TODO: FIXME: 이건 추후에, DifficultySystem으로 수정가능하게
const WAVE_INTERVAL = 5000;
const WAVE_AMOUNT_UNIT = 3;
const WAVE_MAX_AMOUNT_AT_ONCE = 36;
const TRACKER_MAX_COUNT = 150;

const MINIMAL_TIME_INTERVAL = 40;

export default class WaveSystem implements ISystem {
  private _nextWaveTime: number;
  private _waveStage: number;

  private _queryChaser = Ecs.defineQuery([ChaseStore]);

  private _intervalHandlers = new Set<ReturnType<typeof setInterval>>();

  constructor(startTime: number) {
    this._nextWaveTime = startTime + WAVE_INTERVAL;
    this._waveStage = 1;
  }

  destroy() {
    this._intervalHandlers.forEach((handler) => {
      clearInterval(handler);
    });
  }

  update(world: Ecs.IWorld) {
    if (this._nextWaveTime > now()) return;

    const chasers = this._queryChaser(world);

    if (chasers.length > TRACKER_MAX_COUNT) return;

    // const currentAmount = Math.max(
    //   this._waveStage * WAVE_AMOUNT_UNIT,
    //   WAVE_MAX_AMOUNT_AT_ONCE
    // );
    /** DEBUG: */
    const currentAmount = 1;

    /** random creation */
    for (let i = 0; i < currentAmount; i++) {
      createChaser(world, {
        [ComponentKind.Position]: randomPosition() as PositionType,
      });
    }

    switch (this._waveStage % 10) {
      case 1:
        this._createStraightWave(world, {
          amount: 30,
          startPoint: {
            x: 0,
            y: 0,
          },
          endPoint: {
            x: GameContext.VIEW_WIDTH,
            y: 0,
          },
          timeInterval: Math.max(MINIMAL_TIME_INTERVAL, 200 / this._waveStage),
        });
        this._createStraightWave(world, {
          amount: 30,
          startPoint: {
            x: 0,
            y: GameContext.VIEW_HEIGHT,
          },
          endPoint: {
            x: GameContext.VIEW_WIDTH,
            y: GameContext.VIEW_HEIGHT,
          },
          timeInterval: Math.max(MINIMAL_TIME_INTERVAL, 200 / this._waveStage),
        });
        break;

      case 3:
        const startPoint = randomPosition();
        this._createStraightWave(world, {
          amount: 10,
          startPoint,
          endPoint: oppositePositionFrom(startPoint, {
            x: rangedRandomNumber(100, 200),
            y: rangedRandomNumber(100, 200),
          }),
          timeInterval: 100,
        });
        break;

      case 4:
        this._createStraightWave2(world, {
          amount: 10,
          startPoint: randomPosition(),
          locationInterval: {
            x: -5,
            y: -5,
          },
          timeInterval: 100,
        });
        break;
    }

    this._waveStage++;
    this._nextWaveTime = this._nextWaveTime + WAVE_INTERVAL;
  }

  private _createStraightWave(
    world: Ecs.IWorld,
    params: {
      amount: number;
      startPoint: PositionType;
      endPoint: PositionType;
      timeInterval: number;
    }
  ) {
    const { amount, startPoint, endPoint, timeInterval } = params;

    const [xInterval, yInterval] = [
      Math.abs(startPoint.x - endPoint.x) / amount,
      Math.abs(startPoint.y - endPoint.y) / amount,
    ];

    this._setWaveInterval(
      (currentGenCount) => {
        createChaser(world, {
          [ComponentKind.Position]: {
            x: startPoint.x + currentGenCount * xInterval,
            y: startPoint.y + currentGenCount * yInterval,
          },
        });
      },
      amount,
      timeInterval
    );
  }

  private _createStraightWave2(
    world: Ecs.IWorld,
    params: {
      amount: number;
      startPoint: PositionType;
      locationInterval: PositionType;
      timeInterval: number;
    }
  ) {
    const { amount, startPoint, locationInterval, timeInterval } = params;

    this._setWaveInterval(
      (currentGenCount) => {
        createChaser(world, {
          [ComponentKind.Position]: {
            x: startPoint.x + currentGenCount * locationInterval.x,
            y: startPoint.y + currentGenCount * locationInterval.y,
          },
        });
      },
      amount,
      timeInterval
    );
  }

  private _createCircleWave(
    world: Ecs.IWorld,
    params: {
      centerPoint: PositionType;
      radius: number;
      timeInterval: number;
    }
  ) {
    const { centerPoint, radius, timeInterval } = params;

    /** TODO: */
  }

  /** TODO: */
  // private _createCurveWave({}) {}

  private _setWaveInterval(
    cb: (currentGenCount: number) => void,
    amount: number,
    timeInterval: number
  ) {
    let completedGenCount = 0;
    const handler = setInterval(() => {
      if (completedGenCount === amount) {
        clearInterval(handler);
        this._intervalHandlers.delete(handler);
      }

      cb(completedGenCount);
      completedGenCount++;
    }, timeInterval);

    this._intervalHandlers.add(handler);
  }
}

