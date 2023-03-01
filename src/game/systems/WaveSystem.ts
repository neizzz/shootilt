import * as Ecs from 'bitecs';

import Game from '@game';

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

    for (let i = 0; i < currentAmount; i++) {
      createChaser(world, {
        [ComponentKind.Position]: randomPosition() as PositionType,
      });
    }

    this._waveStage++;
    this._nextWaveTime = this._nextWaveTime + WAVE_INTERVAL;
  }
}

