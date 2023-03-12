import * as Ecs from 'bitecs';

import { GameContext } from '@game';

import { ComponentKind } from '@game/models/constant';
import {
  ChaseStore,
  ISystem,
  PositionStore,
  PositionType,
  VelocityStore,
} from '@game/models/ecs';

import { createChaser } from '@game/utils/create-entity';
import { oppositePositionFrom, randomPosition } from '@game/utils/in-game';
import {
  randomFlag,
  randomSignFlag,
  rangedRandomNumber,
} from '@game/utils/math';
import { now } from '@game/utils/time';

import { AvoiderTag, VelocityType } from './../models/ecs';

// TODO: FIXME: 이건 추후에, DifficultySystem으로 수정가능하게
const WAVE_INTERVAL = 5000;
const WAVE_AMOUNT_UNIT = 3;
const WAVE_MAX_AMOUNT_AT_ONCE = 36;
const TRACKER_MAX_COUNT = 200;

const MINIMAL_TIME_INTERVAL = 40;

export default class WaveSystem implements ISystem {
  private _nextWaveTime: number;
  private _waveStage: number;

  private _queryChaser = Ecs.defineQuery([ChaseStore]);
  private _queryAvoider = Ecs.defineQuery([AvoiderTag]);

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

    const currentAmount = Math.min(
      this._waveStage * WAVE_AMOUNT_UNIT,
      WAVE_MAX_AMOUNT_AT_ONCE
    );
    /** DEBUG: */
    // const currentAmount = 1;

    /** random creation */
    for (let i = 0; i < currentAmount; i++) {
      createChaser(world, {
        [ComponentKind.Position]: randomPosition() as PositionType,
      });
    }

    const isMutant = randomFlag();

    switch (this._waveStage % 10) {
      case 1:
        this._createStraightWave(
          world,
          {
            amount: 10 + Math.min(this._waveStage, 30),
            startPoint: {
              x: 0,
              y: 6,
            },
            endPoint: {
              x: GameContext.VIEW_WIDTH,
              y: 0,
            },
            timeInterval: Math.max(
              MINIMAL_TIME_INTERVAL,
              200 / this._waveStage
            ),
          },
          isMutant
            ? {
                velocity: {
                  x: 0,
                  y: Math.min((10 * this._waveStage) / 10, 3),
                },
              }
            : undefined
        );
        this._createStraightWave(
          world,
          {
            amount: 10 + Math.min(this._waveStage, 30),
            startPoint: {
              x: 0,
              y: GameContext.VIEW_HEIGHT - 6,
            },
            endPoint: {
              x: GameContext.VIEW_WIDTH,
              y: GameContext.VIEW_HEIGHT - 6,
            },
            timeInterval: Math.max(
              MINIMAL_TIME_INTERVAL,
              200 / this._waveStage
            ),
          },
          isMutant
            ? {
                velocity: {
                  x: 0,
                  y: -Math.min((10 * this._waveStage) / 10, 3),
                },
              }
            : undefined
        );
        break;

      case 3:
        const startPoint = randomPosition();
        this._createStraightWave(
          world,
          {
            amount: 10,
            startPoint,
            endPoint: oppositePositionFrom(startPoint, {
              x: rangedRandomNumber(100, 200),
              y: rangedRandomNumber(100, 200),
            }),
            timeInterval: 100,
          },
          isMutant
            ? {
                velocity: {
                  x: randomSignFlag() * rangedRandomNumber(0.4, 2),
                  y: randomSignFlag() * rangedRandomNumber(0.4, 2),
                },
              }
            : undefined
        );
        break;

      case 4:
        this._createStraightWave2(
          world,
          {
            amount: 10,
            startPoint: randomPosition(),
            locationInterval: {
              x: randomSignFlag() * rangedRandomNumber(2, 5),
              y: randomSignFlag() * rangedRandomNumber(2, 5),
            },
            timeInterval: 100,
          },
          isMutant
            ? {
                velocity: {
                  x: randomSignFlag() * rangedRandomNumber(0.4, 2),
                  y: randomSignFlag() * rangedRandomNumber(0.4, 2),
                },
              }
            : undefined
        );
        break;

      case 5:
        /** TODO: battle play */
        const avoider = this._queryAvoider(world)[0];
        this._createCircleWave(
          world,
          {
            amount: 15,
            centerPoint: {
              x: PositionStore.x[avoider],
              y: PositionStore.y[avoider],
            },
            radius: Math.max(40, 200 - 5 * this._waveStage),
            timeInterval: 100,
          },
          isMutant
            ? {
                velocity: {
                  x:
                    (VelocityStore.x[avoider] /
                      Math.abs(VelocityStore.x[avoider])) *
                    rangedRandomNumber(0.4, 2),
                  y:
                    (VelocityStore.y[avoider] /
                      Math.abs(VelocityStore.y[avoider])) *
                    rangedRandomNumber(0.4, 2),
                },
              }
            : undefined
        );
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
    },
    mutantOptions?: {
      velocity: VelocityType;
    }
  ) {
    const { amount, startPoint, endPoint, timeInterval } = params;
    const isMutant = !!mutantOptions;

    const [xInterval, yInterval] = [
      Math.abs(startPoint.x - endPoint.x) / amount,
      Math.abs(startPoint.y - endPoint.y) / amount,
    ];

    this._setWaveInterval(
      (currentGenCount) => {
        createChaser(
          world,
          {
            [ComponentKind.Position]: {
              x: startPoint.x + currentGenCount * xInterval,
              y: startPoint.y + currentGenCount * yInterval,
            },
            [ComponentKind.FutureVelocity]: mutantOptions?.velocity,
          },
          isMutant
        );
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
    },
    mutantOptions?: {
      velocity: VelocityType;
    }
  ) {
    const { amount, startPoint, locationInterval, timeInterval } = params;
    const isMutant = !!mutantOptions;

    this._setWaveInterval(
      (currentGenCount) => {
        createChaser(
          world,
          {
            [ComponentKind.Position]: {
              x: startPoint.x + currentGenCount * locationInterval.x,
              y: startPoint.y + currentGenCount * locationInterval.y,
            },
            [ComponentKind.FutureVelocity]: mutantOptions?.velocity,
          },
          isMutant
        );
      },
      amount,
      timeInterval
    );
  }

  private _createCircleWave(
    world: Ecs.IWorld,
    params: {
      amount: number;
      centerPoint: PositionType;
      radius: number;
      timeInterval: number;
    },
    mutantOptions?: {
      velocity: VelocityType;
    }
  ) {
    const { amount, centerPoint, radius, timeInterval } = params;
    const isMutant = !!mutantOptions;

    const thetaInterval = (2 * Math.PI) / amount;

    this._setWaveInterval(
      (currentGenCount) => {
        createChaser(
          world,
          {
            [ComponentKind.Position]: {
              x:
                centerPoint.x +
                radius * Math.cos(currentGenCount * thetaInterval),
              y:
                centerPoint.y +
                radius * Math.sin(currentGenCount * thetaInterval),
            },
            [ComponentKind.FutureVelocity]: mutantOptions?.velocity,
          },
          isMutant
        );
      },
      amount,
      timeInterval
    );
  }

  private _setWaveInterval(
    cb: (currentGenCount: number) => void,
    amount: number,
    timeInterval: number
  ) {
    cb(0);

    let completedGenCount = 1;

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

  private _getVelocityToAvoider(avoiderVelocity: VelocityType) {}
}

