import * as Ecs from 'bitecs';

import { ComponentKind } from '@game/models/constant';
import { PositionType, VelocityType } from '@game/models/ecs';

import { MAX_CHASER_SPEED } from './../models/constant';
import { createChaser } from './create-entity';
import { velocityFromAngle } from './math';

type MutantOptions = {
  directionAngle: number; // radian
  speed: number;
};

const setWaveInterval = (
  cb: (currentGenCount: number) => void,
  amount: number,
  timeInterval: number
) => {
  cb(0);

  let completedGenCount = 1;

  const handler = setInterval(() => {
    if (completedGenCount === amount) {
      clearInterval(handler);
    }

    try {
      cb(completedGenCount++);
    } catch (e) {
      clearInterval(handler);
    }
  }, timeInterval);
};

const getMutantVelocity = (mutantOptions: MutantOptions) => {
  const speed = Math.min(mutantOptions.speed, MAX_CHASER_SPEED);
  return velocityFromAngle(mutantOptions.directionAngle as number, speed);
};

export const createCircleWave = (
  world: Ecs.IWorld,
  params: {
    amount: number;
    centerPoint: PositionType;
    radius: number;
    timeInterval: number;
  },
  mutantOptions?: MutantOptions
) => {
  const { amount, centerPoint, radius, timeInterval } = params;
  const isMutant = !!mutantOptions;

  const thetaInterval = (2 * Math.PI) / amount;

  const creator = (currentGenCount: number) => {
    createChaser(
      world,
      {
        [ComponentKind.Position]: {
          x: centerPoint.x + radius * Math.cos(currentGenCount * thetaInterval),
          y: centerPoint.y + radius * Math.sin(currentGenCount * thetaInterval),
        },
        [ComponentKind.FutureVelocity]: isMutant
          ? getMutantVelocity(mutantOptions as MutantOptions)
          : undefined,
      },
      isMutant
    );
  };

  if (timeInterval === 0) {
    for (let currentGenCount = 0; currentGenCount < amount; currentGenCount++) {
      creator(currentGenCount);
    }
  } else {
    setWaveInterval(creator, amount, timeInterval);
  }
};

export const createStraightWave = (
  world: Ecs.IWorld,
  params: {
    amount: number;
    startPoint: PositionType;
    endPoint: PositionType;
    timeInterval: number;
  },
  mutantOptions?: MutantOptions
) => {
  const { amount, startPoint, endPoint, timeInterval } = params;
  const isMutant = !!mutantOptions;

  const [xInterval, yInterval] = [
    (endPoint.x - startPoint.x) / amount,
    (endPoint.y - startPoint.y) / amount,
  ];

  const creator = (currentGenCount: number) => {
    createChaser(
      world,
      {
        [ComponentKind.Position]: {
          x: startPoint.x + currentGenCount * xInterval,
          y: startPoint.y + currentGenCount * yInterval,
        },
        [ComponentKind.FutureVelocity]: isMutant
          ? getMutantVelocity(mutantOptions as MutantOptions)
          : undefined,
      },
      isMutant
    );
  };

  if (timeInterval === 0) {
    for (let currentGenCount = 0; currentGenCount < amount; currentGenCount++) {
      creator(currentGenCount);
    }
  } else {
    setWaveInterval(creator, amount, timeInterval);
  }
};

/** based location interval */
export const createStraightWave2 = (
  world: Ecs.IWorld,
  params: {
    amount: number;
    startPoint: PositionType;
    angle: number; // radian
    locationInterval: number;
    timeInterval: number;
  },
  mutantOptions?: MutantOptions
) => {
  const { amount, startPoint, angle, locationInterval, timeInterval } = params;
  const isMutant = !!mutantOptions;
  const dx = locationInterval * Math.sin(angle);
  const dy = locationInterval * Math.cos(angle);

  const creator = (currentGenCount: number) => {
    createChaser(
      world,
      {
        [ComponentKind.Position]: {
          x: startPoint.x + currentGenCount * dx,
          y: startPoint.y + currentGenCount * dy,
        },
        [ComponentKind.FutureVelocity]: isMutant
          ? getMutantVelocity(mutantOptions as MutantOptions)
          : undefined,
      },
      isMutant
    );
  };

  if (timeInterval === 0) {
    for (let currentGenCount = 0; currentGenCount < amount; currentGenCount++) {
      creator(currentGenCount);
    }
  } else {
    setWaveInterval(creator, amount, timeInterval);
  }
};

