export default function intentFromObject(obj) {
  return {
    id: obj.id,
    pos: { x: obj._x, y: obj._y },
    vel: { x: obj.velocity?.x || 0, y: obj.velocity?.y || 0 },
    mass:       typeof obj.mass === "function" ? obj.mass : (obj.mass ?? 1),
    radius:     typeof obj.size === "function" ? obj.size : (obj.size ?? 10),
    bounciness: typeof obj.bounciness === "function" ? obj.bounciness : (obj.bounciness ?? 0.2),
    type: obj.constructor?.name || "object",
    forces: obj.forces ?? [],
  };
}