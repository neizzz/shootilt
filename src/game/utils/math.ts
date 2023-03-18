import { PositionType, VelocityType } from '@game/models/ecs';

export const distance = (p1: PositionType, p2: PositionType): number => {
  return Math.sqrt(
    (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)
  );
};

/** calculate clock-wise radian based on y-axis */
export const theta = (base: PositionType, target: PositionType): number => {
  const diffX = target.x - base.x;
  const diffY = target.y - base.y;
  let theta: number;

  if (diffX === 0) {
    theta = diffY < 0 ? 0 : Math.PI;
  } else {
    theta = Math.atan(diffY / diffX);
  }

  if (diffX > 0) {
    theta += Math.PI / 2;
  } else if (diffX < 0) {
    theta += Math.PI + Math.PI / 2;
  }
  return theta;
};

export const rangedRandomNumber = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

/** assume both 'min' and 'max' are integer. */
export const rangedRandomInteger = (min: number, max: number) => {
  return Math.floor(rangedRandomNumber(min, max + 0.99));
};

export const randomFlag = () => {
  return !!Math.floor(Math.random() * 2);
};

export const randomSignFlag = () => {
  return randomFlag() ? -1 : 1;
};

export const velocityFromAngle = (
  angle: number /** radian */,
  speed = 1
): VelocityType => {
  return {
    x: Math.sin(angle) * speed,
    y: -Math.cos(angle) * speed,
  };
};

/** viewport(?) quadrant based 0 index */
export const quadrant = (base: PositionType): 0 | 1 | 2 | 3 => {
  if (base.x >= 0) {
    return base.y >= 0 ? 0 : 3;
  } else {
    return base.y >= 0 ? 1 : 2;
  }
};

/** NOTE: height > width */
// export const headCircleCenter = (
//   width: number,
//   height: number,
//   rotation: number
// ): SimplePoint => {
//   const centerDist = height / 2 - width / 2;

//   return {
//     x: centerDist * Math.sin(rotation),
//     y: -centerDist * Math.cos(rotation),
//   };
// };

