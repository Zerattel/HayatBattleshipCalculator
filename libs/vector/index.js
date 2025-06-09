import { Vector } from './vector.js';

export { operatorCalc as calc } from './operator.js';
export {
  Vector,
  Victor,
  Victor as IVector,
  vector,
  victor,
  victor as ivector,
  FORWARD,
  LEFT,
  UP,
  RIGHT
} from './vector.js';
export { Point, IPoint, point, ipoint } from './point.js';
export { Quaternion, IQuaternion, IDENTITY, quaternion, iquaternion, fromOrientation } from './quaternion.js';
export { Degree, IDegree, degree, idegree } from './degree.js';
export { Color, IColor, color, icolor } from './color.js';
export { IMat3 } from './mat3';
export { radians, degrees } from './angles.js';

export default Vector;
