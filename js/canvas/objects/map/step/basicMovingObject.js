import { toRealDirection } from "../../../../../libs/canvas.js";
import BasicStepObject from "./basicStepObject.js";
import { calc, point } from "../../../../../libs/vector/vector.js";
import { registerClass } from "../../../../save&load/objectCollector.js";
import { registerSteps } from "./stepInfoCollector.js";
import { log } from "../../../../controls/step-logs/log.js";

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

  get direction() {
    return toRealDirection(this._direction);
  }

  set direction(val) {
    if (val == 0) return (this._direction = 180);

    return (this._direction = -val + 180);
  }

  next() {
    let data = super.next();

    const rx = this.velocity.x * this._step,
      ry = this.velocity.y * this._step;

    this.moveTo(this._x + rx, this._y + ry);
    (rx != 0 || ry != 0) &&
      log(
        this.path,
        `next | moved (${this._x - rx}, ${this._y - ry}) -> (${this._x}, ${this._y}) [${rx}, ${ry}]`
      );

    return data;
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
registerSteps(BasicMovingObject, 0, []);
