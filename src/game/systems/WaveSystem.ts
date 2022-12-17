import Game from '..';
import { ISystem } from '../models/system';
import { TimeValue } from '../models/common';
import { now } from '../utils/time';
import { randomPosition } from '../utils/random';

// TODO: FIXME: 이건 추후에, DifficultySystem으로 수정가능하게
const WAVE_INTERVAL = 5000 as TimeValue;
const WAVE_AMOUNT_UNIT = 3;
const WAVE_MAX_AMOUNT_AT_ONCE = 36;
const TRACKER_MAX_COUNT = 150;

type TrackerAdder = (positionX: number, positionY: number) => void;

export default class WaveSystem implements ISystem {
  private _getStartTime: InstanceType<typeof Game>['getStartTime'];
  private _getTrackerCount: () => number;
  private _addTracker: TrackerAdder;
  private _nextWaveTime: TimeValue;
  private _waveStage: number;

  constructor(
    trackerAdder: TrackerAdder,
    trackerCountGetter: () => number,
    startTimeGetter: () => TimeValue
  ) {
    this._getStartTime = startTimeGetter;
    this._getTrackerCount = trackerCountGetter;
    this._addTracker = trackerAdder;
    this._nextWaveTime = (this._getStartTime() + WAVE_INTERVAL) as TimeValue;
    this._waveStage = 1;
  }

  update() {
    if (this._nextWaveTime > now()) return;
    if (this._getTrackerCount() > TRACKER_MAX_COUNT) return;

    const currentAmount = Math.max(
      this._waveStage * WAVE_AMOUNT_UNIT,
      WAVE_MAX_AMOUNT_AT_ONCE
    );

    for (let i = 0; i < currentAmount; i++) {
      const position = randomPosition();
      this._addTracker(position.x, position.y);
    }

    this._waveStage++;
    this._nextWaveTime = (this._nextWaveTime + WAVE_INTERVAL) as TimeValue;
  }
}

