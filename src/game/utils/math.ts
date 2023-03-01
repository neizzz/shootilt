import { PositionType } from '@game/models/ecs';

export const distance = (p1: PositionType, p2: PositionType): number => {
  return Math.sqrt(
    (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)
  );
};

/** calculate theta(radian) based on y-axis */
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

