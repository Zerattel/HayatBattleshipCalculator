// js/physics/engine.js
// Централизованный 2D physics engine (круги). Интегратор: semi-implicit Euler + субшаги.
// Экспорт: класс PhysicsEngine с методами setStep, registerIntent, simulate, exportStates.

import { point } from "../../libs/vector/point.js"; // при необходимости поправьте путь

export default class PhysicsEngine {
  constructor() {
    this.bodies = new Map();
    this.dt = 1.0;          
    this.substeps = 4;      
    this.globalDamping = 0.0;
    this.collisionEvents = [];
  }

  setStep(dt, substeps = 4) {
    this.dt = dt;
    this.substeps = Math.max(1, substeps|0);
  }

  // intent: { id, pos: {x,y} or point, vel: {x,y} or point, mass, radius, type, bounciness, forces: [{x,y}] }
  registerIntent(intent) {
    const pos = intent.pos?.x !== undefined ? { x: +intent.pos.x, y: +intent.pos.y } : { x: +intent.pos[0] || 0, y: +intent.pos[1] || 0 };
    const vel = intent.vel?.x !== undefined ? { x: +intent.vel.x, y: +intent.vel.y } : { x: +(intent.vel?.[0]||0), y: +(intent.vel?.[1]||0) };
    this.bodies.set(intent.id, {
      id: intent.id,
      mass: intent.mass || 1,
      pos,
      vel,
      radius: intent.radius || 10,
      type: intent.type || "ship",
      bounciness: typeof intent.bounciness === "number" ? intent.bounciness : (intent.bounciness ?? 0.2),
      forces: intent.forces ? intent.forces.map(f => ({ x:+f.x||0, y:+f.y||0 })) : [],
      prevPos: { x: pos.x, y: pos.y }
    });
  }

  unregister(id) {
    this.bodies.delete(id);
  }

  simulate(substepCallback) {
    this.collisionEvents = [];
    const dtSub = this.dt / this.substeps;

    // prepare prevPos for CCD
    for (const b of this.bodies.values()) {
      b.prevPos.x = b.pos.x;
      b.prevPos.y = b.pos.y;
    }

    let s = 0;

    return () => {
      if (s >= this.substeps) return false;

      // integrate forces -> velocity -> pos (semi-implicit Euler)
      for (const b of this.bodies.values()) {
        // sum forces
        let Fx = 0, Fy = 0;
        for (const f of b.forces) { Fx += f.x; Fy += f.y; }
        const ax = Fx / b.mass;
        const ay = Fy / b.mass;
        b.vel.x += ax * dtSub;
        b.vel.y += ay * dtSub;

        if (this.globalDamping) {
          b.vel.x *= (1 - this.globalDamping * dtSub);
          b.vel.y *= (1 - this.globalDamping * dtSub);
        }

        b.pos.x += b.vel.x * dtSub;
        b.pos.y += b.vel.y * dtSub;
      }

      // collision detection & resolution (pairwise, O(n^2) — можно заменить spatial hash / quadtree)
      const arr = Array.from(this.bodies.values());
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const A = arr[i], B = arr[j];
          // CCD: если сегмент prev->pos пересекает круг другого — считаем коллизией
          if (this._segmentIntersectsCircle(A.prevPos, A.pos, B.pos, B.radius) ||
              this._segmentIntersectsCircle(B.prevPos, B.pos, A.pos, A.radius) ||
              this._circlesIntersect(A.pos, B.pos, A.radius, B.radius)) {
            this._resolveCollision(A, B);
          }
        }
      }

      // update prevPos for next substep CCD
      for (const b of this.bodies.values()) {
        b.prevPos.x = b.pos.x;
        b.prevPos.y = b.pos.y;
      }


      substepCallback?.(s);
      return ++s;
    }
  }

  // основной шаг: вызывает серию substeps
  instantSimulate(substepCallback) {
    this.collisionEvents = [];
    const dtSub = this.dt / this.substeps;

    // prepare prevPos for CCD
    for (const b of this.bodies.values()) {
      b.prevPos.x = b.pos.x;
      b.prevPos.y = b.pos.y;
    }

    // субшаги
    for (let s = 0; s < this.substeps; s++) {
      // integrate forces -> velocity -> pos (semi-implicit Euler)
      for (const b of this.bodies.values()) {
        // sum forces
        let Fx = 0, Fy = 0;
        for (const f of b.forces) { Fx += f.x; Fy += f.y; }
        const ax = Fx / b.mass;
        const ay = Fy / b.mass;
        b.vel.x += ax * dtSub;
        b.vel.y += ay * dtSub;

        if (this.globalDamping) {
          b.vel.x *= (1 - this.globalDamping * dtSub);
          b.vel.y *= (1 - this.globalDamping * dtSub);
        }

        b.pos.x += b.vel.x * dtSub;
        b.pos.y += b.vel.y * dtSub;
      }

      // collision detection & resolution (pairwise, O(n^2) — можно заменить spatial hash / quadtree)
      const arr = Array.from(this.bodies.values());
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const A = arr[i], B = arr[j];
          // CCD: если сегмент prev->pos пересекает круг другого — считаем коллизией
          if (this._segmentIntersectsCircle(A.prevPos, A.pos, B.pos, B.radius) ||
              this._segmentIntersectsCircle(B.prevPos, B.pos, A.pos, A.radius) ||
              this._circlesIntersect(A.pos, B.pos, A.radius, B.radius)) {
            this._resolveCollision(A, B);
          }
        }
      }

      // update prevPos for next substep CCD
      for (const b of this.bodies.values()) {
        b.prevPos.x = b.pos.x;
        b.prevPos.y = b.pos.y;
      }


      substepCallback?.(s);
    } // end substeps
  }

  // check circle overlap
  _circlesIntersect(p1, p2, r1, r2) {
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const d2 = dx*dx + dy*dy;
    const rr = r1 + r2;
    return d2 <= rr*rr;
  }

  // segment p1->p2 intersects circle center c with radius r
  _segmentIntersectsCircle(p1, p2, c, r) {
    const vx = p2.x - p1.x, vy = p2.y - p1.y;
    const wx = p1.x - c.x, wy = p1.y - c.y;
    const a = vx*vx + vy*vy;
    if (a === 0) return ((wx*wx + wy*wy) <= r*r);
    const b = 2*(wx*vx + wy*vy);
    const cc = wx*wx + wy*wy - r*r;
    const disc = b*b - 4*a*cc;
    if (disc < 0) return false;
    const sd = Math.sqrt(disc);
    const t1 = (-b - sd) / (2*a);
    const t2 = (-b + sd) / (2*a);
    if ((t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)) return true;
    return false;
  }

  // simple positional correction + impulse (1D along normal)
  _resolveCollision(A, B) {
    const nx = B.pos.x - A.pos.x, ny = B.pos.y - A.pos.y;
    let dist = Math.hypot(nx, ny);
    if (dist === 0) { dist = 1e-6; }
    const normalX = nx / dist, normalY = ny / dist;
    const penetration = (A.radius + B.radius) - dist;
    if (penetration <= 0) return;

    const invA = 1 / A.mass, invB = 1 / B.mass;
    const totalInv = invA + invB;

    // positional correction proportional to inverse mass
    const correctionX = normalX * (penetration / totalInv);
    const correctionY = normalY * (penetration / totalInv);
    A.pos.x -= correctionX * invA;
    A.pos.y -= correctionY * invA;
    B.pos.x += correctionX * invB;
    B.pos.y += correctionY * invB;

    // relative velocity along normal
    const relVx = B.vel.x - A.vel.x;
    const relVy = B.vel.y - A.vel.y;
    const relAlong = relVx*normalX + relVy*normalY;
    if (relAlong >= 0) return; // separating

    const e = Math.min(A.bounciness, B.bounciness);
    const j = -(1 + e) * relAlong / (totalInv);
    const impulseX = normalX * j, impulseY = normalY * j;

    A.vel.x -= impulseX * invA;
    A.vel.y -= impulseY * invA;
    B.vel.x += impulseX * invB;
    B.vel.y += impulseY * invB;

    const contactPoint = {
      x: (A.pos.x + B.pos.x) / 2,
      y: (A.pos.y + B.pos.y) / 2
    };

    this.collisionEvents.push({
      a: A.id,
      b: B.id,
      point: contactPoint,
      normal: { x: normalX, y: normalY },
      relVel: relAlong,
      impulse: j,
      energy: 0.5 * j * Math.abs(relAlong)
    });
  }

  // states for finalize: возвращаем point(...) для совместимости с вашим кодом
  exportStates() {
    const states = {};
    for (const [id, b] of this.bodies.entries()) {
      states[id] = {
        id,
        pos: point(b.pos.x, b.pos.y),
        vel: point(b.vel.x, b.vel.y),
        radius: b.radius,
        type: b.type
      };
    }
    return { states, collisions: this.collisionEvents.slice() };
  }
}
