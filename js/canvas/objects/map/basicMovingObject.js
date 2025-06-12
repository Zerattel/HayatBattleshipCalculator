import { toRealDirection } from "../../../../libs/canvas.js";
import BasicStepObject from "./basicStepObject.js";
import { calc, vector } from "../../../../libs/vector/vector.js";
import { registerClass } from "../../../save&load/objectCollector.js";

export default class BasicMovingObject extends BasicStepObject {
  velocity = vector(0, 0);
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
        vector(Math.sin((this._direction / 180) * Math.PI), Math.cos((this._direction / 180) * Math.PI)) *
          amount
    );
  }

  get direction() {
    return toRealDirection(this._direction);
  }

  set direction(val) {
    if (val == 0) return this._direction = 180

    return this._direction = -val + 180;
  }

  draw(canvas, ctx, toCanvas, style) {
    super.draw(canvas, ctx, toCanvas, style);
    
    ctx.lineWidth = 20;

    const x = toCanvas(this._x);
    const y = toCanvas(this._y);

    ctx.strokeStyle = style.getPropertyValue("--direction");
    const direction = vector(Math.sin((this._direction / 180) * Math.PI), Math.cos((this._direction / 180) * Math.PI));

    ctx.setLineDash([50, 50]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + direction.x * 500, y + direction.y * 500);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = style.getPropertyValue("--velocity");

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + toCanvas(this.velocity.x) * this._step, y + toCanvas(this.velocity.y) * this._step);
    ctx.stroke();
  }

  next() {
    super.next();

    this.moveTo(this._x + this.velocity.x * this._step, this._y + this.velocity.y * this._step);
  }


  save(realParent=null) {
    return {
      ...super.save(realParent),
      velocity: [this.velocity.x, this.velocity.y],
      direction: this._direction,
    }
  }

  load(data, loadChildren=false) {
    super.load(data, false);
    this.velocity = vector(data.velocity[0], data.velocity[1]);
    this._direction = data.direction;

    loadChildren && super.loadChildren(data);
  } 
}

registerClass(BasicMovingObject)