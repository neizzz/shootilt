import * as Ecs from 'bitecs';

import Game, { GameContext } from '@game';

import { ComponentKind } from '@game/models/constant';
import { ChaseStore, ISystem, PositionType } from '@game/models/ecs';

import { createChaser } from '@game/utils/create-entity';
import { randomPosition } from '@game/utils/in-game';
import { now } from '@game/utils/time';

// TODO: FIXME: 이건 추후에, DifficultySystem으로 수정가능하게
const WAVE_INTERVAL = 1000;
const WAVE_AMOUNT_UNIT = 3;
const WAVE_MAX_AMOUNT_AT_ONCE = 36;
const TRACKER_MAX_COUNT = 150;

// type TrackerAdder = (positionX: number, positionY: number) => void;

export default class WaveSystem implements ISystem {
  private _getStartTime: InstanceType<typeof Game>['getStartTime'];
  private _nextWaveTime: number;
  private _waveStage: number;

  private _queryChaser = Ecs.defineQuery([ChaseStore]);

  constructor(startTimeGetter: () => number) {
    this._getStartTime = startTimeGetter;

    this._nextWaveTime = this._getStartTime() + WAVE_INTERVAL;
    this._waveStage = 1;
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

    switch (this._waveStage) {
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
          timeInterval: 100,
        });
        break;

      case 3:
        this._createStraightWave(world, {
          amount: 10,
          startPoint: {
            x: 50,
            y: 50,
          },
          endPoint: {
            x: 150,
            y: 150,
          },
          timeInterval: 100,
        });
        break;

      case 4:
        this._createStraightWave2(world, {
          amount: 10,
          startPoint: {
            x: 600,
            y: 300,
          },
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
    let completeGenCount = 0;

    const [xInterval, yInterval] = [
      Math.abs(startPoint.x - endPoint.x) / amount,
      Math.abs(startPoint.y - endPoint.y) / amount,
    ];

    const handler = setInterval(() => {
      if (completeGenCount === amount) {
        clearInterval(handler);
      }

      completeGenCount++;
      createChaser(world, {
        [ComponentKind.Position]: {
          x: startPoint.x + completeGenCount * xInterval,
          y: startPoint.y + completeGenCount * yInterval,
        },
      });
    }, timeInterval);
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
    let completeGenCount = 0;

    const handler = setInterval(() => {
      if (completeGenCount === amount) {
        clearInterval(handler);
      }

      completeGenCount++;
      createChaser(world, {
        [ComponentKind.Position]: {
          x: startPoint.x + completeGenCount * locationInterval.x,
          y: startPoint.y + completeGenCount * locationInterval.y,
        },
      });
    }, timeInterval);
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
}

