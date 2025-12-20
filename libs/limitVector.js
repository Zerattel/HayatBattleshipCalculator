export function limitVector(vector, max) {
  let magnitude = vector.length;
  if (magnitude > max && magnitude > 0) {
    vector.x = (vector.x / magnitude) * max;
    vector.y = (vector.y / magnitude) * max;
  }
  return vector;
}