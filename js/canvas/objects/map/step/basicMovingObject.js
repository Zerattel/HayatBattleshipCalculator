import { toRealDirection } from "../../../../../libs/canvas.js";
import BasicStepObject from "./basicStepObject.js";
import { calc, point } from "../../../../../libs/vector/vector.js";
import { registerClass } from "../../../../save&load/objectCollector.js";
import { registerSteps } from "./stepInfoCollector.js";
import { log } from "../../../../controls/step-logs/log.js";
import { objects } from "../../../map.js";
import { collisionPoint } from "../../../../../libs/math.js";

export default class BasicMovingObject extends BasicStepObject {
  velocity = point(0, 0);
  _direction = 0;

  constructor(x, y, direction, velocity) {
    super(x, y, 6);

    this.direction = direction || 0;
    if (velocity) this.applyForce(velocity);
  }

  applyForce(amount) {
    const dirRad = (this._direction / 180) * Math.PI;

    let force;

    if (typeof amount === "number") {
      force = calc(() => point(
        Math.sin(dirRad),
        Math.cos(dirRad)
      ) * amount);
    } else {
      const rotated = point(
        amount.x * Math.cos(dirRad) - amount.y * Math.sin(dirRad),
        amount.x * Math.sin(dirRad) + amount.y * Math.cos(dirRad)
      );

      force = rotated;
    }

    this.velocity = calc(() => this.velocity + force);
  }
  
  collision = true;

  get size() {
    return 30;
  }

  get mass() {
    return 1;
  }

  get bounciness() {
    return 1;
  }

  get direction() {
    return toRealDirection(this._direction);
  }

  set direction(val) {
    if (val == 0) return (this._direction = 180);

    return (this._direction = -val + 180);
  }


  finalize(objectsData) {
    const phys = objectsData[this.id]?._physics;
    if (phys) {
      this._x = phys.pos.x;
      this._y = phys.pos.y;
      this.velocity = phys.vel;
    }

    const collisions = objectsData._physics_collisions || [];
    for (const c of collisions) {
      if (c.a === this.id || c.b === this.id) {
        const targetObj = objects[c.a === this.id ? c.b : c.a];
        if (!targetObj) continue;

        this.onCollision(
          c,
          targetObj
        );
      }
    }

    super.finalize(objectsData);
  }


  onCollision(collision, target) {
    let energy = collision.energy;
    if (energy === undefined) {
        energy = 0.5 * impulse * Math.abs(relVel);
    }

    log(this.path, `onCollision | collision!<br>
      ----------- | with ${target.path}<br>
      ----------- | collision: ${collision.point.x}m x ${collision.point.y}m<br>
      ----------- | energy: ${(Math.round(energy / 1000)).toLocaleString('en-US', { maximumFractionDigits: 1, notation: "compact" })} kJ<br>
      ----------- | resulted impulse: ${this.impulse}<br>`)

    return energy;
  }

  getOverridableValues() {
    return [
      ...super.getOverridableValues(),
      // {
      //   name: "velocity_x",
      //   type: "number",
      //   current: () => Math.round(this.velocity.x * 1000) / 1000,
      //   func: (val) => {
      //     this.velocity.x = val;
      //   },
      // },
      // {
      //   name: "velocity_y",
      //   type: "number",
      //   current: () => Math.round(this.velocity.y * 1000) / 1000,
      //   func: (val) => {
      //     this.velocity.y = val;
      //   },
      // },
      {
        name: "direction",
        type: "number",
        current: () => Math.round(this.direction * 1000) / 1000,
        func: (val) => {
          this.direction = val;
        },
      },
      {
        name: "speed",
        type: "number",
        current: () => Math.round(this.velocity.length * 1000) / 1000,
        func: (val) => {
          this.velocity = point(
            () =>
              point(
                Math.sin((this._direction / 180) * Math.PI),
                Math.cos((this._direction / 180) * Math.PI)
              ) * val
          );
        },
      },
    ];
  }

  save(realParent = null) {
    return {
      ...super.save(realParent),
      velocity: [this.velocity.x, this.velocity.y],
      direction: this._direction,
    };
  }

  load(data, loadChildren = false) {
    super.load(data, false);
    this.velocity = point(data.velocity[0], data.velocity[1]);
    this._direction = data.direction;

    loadChildren && super.loadChildren(data);
  }
}

registerClass(BasicMovingObject);
registerSteps(BasicMovingObject, 3, []);
