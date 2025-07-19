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
    this.velocity = calc(
      () =>
        this.velocity +
        point(
          Math.sin((this._direction / 180) * Math.PI),
          Math.cos((this._direction / 180) * Math.PI)
        ) *
          amount
    );
  }

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

  step(index, objectsData) {
    let data = super.step(index, objectsData);
    
    if (index == 0) {
      const rx = this.velocity.x * this._step,
            ry = this.velocity.y * this._step;
      data.maneuver = {};
      data.maneuver.startPoint = [this._x, this._y];

      this.moveTo(this._x + rx, this._y + ry);
      (rx != 0 || ry != 0) &&
        log(
          this.path,
          `next | moved (${this._x - rx}, ${this._y - ry}) -> (${this._x}, ${this._y}) [${rx}, ${ry}]`
        );
      
      data.maneuver.endPoint = [this._x, this._y];
      data.maneuver.delta = [rx, ry];
    }

    if (index == 2) {
      for (let [n, target] of Object.entries(objects)) {
        if (n == this.id) continue;

        const collision = collisionPoint(
          this.size,
          objectsData[this.id].maneuver.startPoint,
          objectsData[this.id].maneuver.endPoint,
          target.size,
          objectsData[n].maneuver.startPoint,
          objectsData[n].maneuver.endPoint
        );

        if (collision.collision) {
          this.onCollision(collision, target, objectsData[this.id], objectsData[n]);
        }
      }
    }

    return data;
  }

  onCollision(collision, target, thisManeuver, targetManeuver) {
    const mp1 = point(...thisManeuver.maneuver.startPoint),
      mp2 = point(...thisManeuver.maneuver.endPoint),
      tp1 = point(...targetManeuver.maneuver.startPoint),
      tp2 = point(...targetManeuver.maneuver.endPoint);
    
    const v1 = point(() => (mp2 - mp1) / this._step);
    const v2 = point(() => (tp2 - tp1) / target._step);

    const energy = (0.5 * this.mass * v1.length ** 2 + 0.5 * target.mass * v2.length ** 2);

    const m1 = this.mass;
    const m2 = target.mass;
    const collisionNormal = point(collision.p2[0] - collision.p1[0], collision.p2[1] - collision.p1[1]).normalize();
    
    const v1n = collisionNormal.dot(v1);
    const v2n = collisionNormal.dot(v2);

    const v1t = point(() => v1 - collisionNormal * v1n)
    
    this.velocity = point(() => (v1t + collisionNormal * (((m1 - m2) * v1n + 2 * m2 * v2n) / (m1 + m2))) * this.bounciness);

    const rx = this.velocity.x * this._step * (1 - collision.time),
          ry = this.velocity.y * this._step * (1 - collision.time);

    this.moveTo(collision.p1[0] + rx, collision.p1[1] + ry);

    log(this.path, `onCollision | collision!<br>
      ----------- | with ${target.path}<br>
      ----------- | speeds: ${v1.length} m/s | ${v2.length} m/s<br>
      ----------- | collision: ${collision.point[0]}m x ${collision.point[1]}m<br>
      ----------- | energy: ${(Math.round(energy / 1000)).toLocaleString('en-US', { maximumFractionDigits: 1, notation: "compact" })} kJ<br>
      ----------- | resulted velocity: ${this.velocity.length}<br>
      ----------- | resulted position: ${this._x}m x ${this._y}m<br>`)

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
registerSteps(BasicMovingObject, 1, []);
