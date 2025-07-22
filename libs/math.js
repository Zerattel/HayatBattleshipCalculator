export function getExternalTangentPoints(x1, y1, r1, x2, y2, r2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const d = Math.hypot(dx, dy);

  if (d < Math.abs(r1 - r2)) {
    return null;
  }
  if (d === 0 && r1 === r2) {
    return null;
  }

  const vx = dx / d;
  const vy = dy / d;

  const res = [];
  for (const sign of [+1, -1]) {
    const alpha = Math.acos((r1 - r2) / d) * sign;

    const sinA = Math.sin(alpha);
    const cosA = Math.cos(alpha);

    const rx = vx * cosA - vy * sinA;
    const ry = vx * sinA + vy * cosA;

    const p1 = {
      x: x1 + r1 * rx,
      y: y1 + r1 * ry,
    };
    const p2 = {
      x: x2 + r2 * rx,
      y: y2 + r2 * ry,
    };
    res.push({ p1, p2 });
  }
  return res;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

const vectorOps = {
  // Vector addition: [x1, y1] + [x2, y2]
  add: (v1, v2) => [v1[0] + v2[0], v1[1] + v2[1]],

  // Vector subtraction: [x1, y1] - [x2, y2]
  sub: (v1, v2) => [v1[0] - v2[0], v1[1] - v2[1]],

  // Scalar multiplication: k * [x, y]
  mul: (scalar, v) => [scalar * v[0], scalar * v[1]],

  // Dot product: [x1, y1] · [x2, y2]
  dot: (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1],

  // Vector magnitude: |[x, y]|
  norm: (v) => Math.sqrt(v[0] * v[0] + v[1] * v[1]),

  // Vector squared magnitude (avoids sqrt for efficiency)
  normSquared: (v) => v[0] * v[0] + v[1] * v[1],
};

/**
 * Detects collision between two moving circles
 *
 * Mathematical approach:
 * - Circle positions: p1(t) = p1_start + t*(p1_end - p1_start)
 *                    p2(t) = p2_start + t*(p2_end - p2_start)
 * - Collision condition: |p1(t) - p2(t)| = r1 + r2
 * - Squared: |p1(t) - p2(t)|² = (r1 + r2)²
 * - Leads to quadratic: At² + Bt + C = 0
 *
 * @param {number} r1 - Radius of first circle
 * @param {Array} p1_start - Starting position [x, y] of first circle
 * @param {Array} p1_end - Ending position [x, y] of first circle
 * @param {number} r2 - Radius of second circle
 * @param {Array} p2_start - Starting position [x, y] of second circle
 * @param {Array} p2_end - Ending position [x, y] of second circle
 * @returns {Object} Collision result object
 */
export function collisionPoint(r1, p1_start, p1_end, r2, p2_start, p2_end) {
  const { add, sub, mul, dot, norm } = vectorOps;

  // Calculate velocity vectors
  const v1 = sub(p1_end, p1_start); // velocity of circle 1
  const v2 = sub(p2_end, p2_start); // velocity of circle 2

  // Initial position difference and relative velocity
  const dp = sub(p1_start, p2_start); // initial position difference
  const dv = sub(v1, v2); // relative velocity

  // Handle edge case: both circles stationary
  if (norm(v1) < 1e-10 && norm(v2) < 1e-10) {
    const distance = norm(dp);
    const collision = distance <= r1 + r2;
    return {
      collision,
      time: collision ? 0 : -1,
      point: collision ? add(p1_start, mul(r1 / (r1 + r2), sub(p2_start, p1_start))) : null,
      p1: collision ? p1_start : null,
      p2: collision ? p2_start : null,
    };
  }

  // Quadratic equation coefficients: At² + Bt + C = 0
  // where |dp + t*dv|² = (r1 + r2)²
  const A = dot(dv, dv); // coefficient of t²
  const B = 2 * dot(dp, dv); // coefficient of t
  const C = dot(dp, dp) - (r1 + r2) * (r1 + r2); // constant term

  // Handle edge case: relative velocity is zero (parallel movement)
  if (Math.abs(A) < 1e-10) {
    // Linear case: Bt + C = 0
    if (Math.abs(B) < 1e-10) {
      // No relative motion, check if already colliding
      const collision = C <= 0;
      return {
        collision,
        time: collision ? 0 : -1,
        point: collision ? add(p1_start, mul(r1 / (r1 + r2), sub(p2_start, p1_start))) : null,
        p1: collision ? p1_start : null,
        p2: collision ? p2_start : null,
      };
    } else {
      // Linear solution: t = -C/B
      const t = -C / B;
      if (t >= 0 && t <= 1) {
        const p1_collision = add(p1_start, mul(t, v1));
        const p2_collision = add(p2_start, mul(t, v2));
        const collision_point = add(
          p1_collision,
          mul(r1 / (r1 + r2), sub(p2_collision, p1_collision))
        );

        return {
          collision: true,
          time: t,
          point: collision_point,
          p1: p1_collision,
          p2: p2_collision,
        };
      }
    }

    return {
      collision: false,
      time: -1,
      point: null,
      p1: null,
      p2: null,
    };
  }

  // Solve quadratic equation
  const discriminant = B * B - 4 * A * C;

  // No real solutions - circles never collide
  if (discriminant < 0) {
    return {
      collision: false,
      time: -1,
      point: null,
      p1: null,
      p2: null,
    };
  }

  // Calculate the two possible collision times
  const sqrtDiscriminant = Math.sqrt(discriminant);
  const t1 = (-B - sqrtDiscriminant) / (2 * A);
  const t2 = (-B + sqrtDiscriminant) / (2 * A);

  // Find the earliest valid collision time in range [0, 1]
  let collisionTime = -1;

  // Check t1 first (earlier time)
  if (t1 >= 0 && t1 <= 1) {
    collisionTime = t1;
  } else if (t2 >= 0 && t2 <= 1) {
    collisionTime = t2;
  }

  // No valid collision time found
  if (collisionTime === -1) {
    return {
      collision: false,
      time: -1,
      point: null,
      p1: null,
      p2: null,
    };
  }

  // Calculate positions at collision time
  const p1_collision = add(p1_start, mul(collisionTime, v1));
  const p2_collision = add(p2_start, mul(collisionTime, v2));

  // Calculate the exact collision point (on the line connecting circle centers)
  const center_diff = sub(p2_collision, p1_collision);
  const center_distance = norm(center_diff);

  // Handle edge case where centers coincide
  let collision_point;
  if (center_distance < 1e-10) {
    collision_point = p1_collision;
  } else {
    // Point on the line between centers, at distance r1 from center 1
    const unit_direction = mul(1 / center_distance, center_diff);
    collision_point = add(p1_collision, mul(r1, unit_direction));
  }

  return {
    collision: true,
    time: collisionTime,
    point: collision_point,
    p1: p1_collision,
    p2: p2_collision,
  };
}
