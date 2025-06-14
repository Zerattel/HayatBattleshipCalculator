import { point } from "../../../../libs/vector/vector.js";
import { registerClass } from "../../../save&load/objectCollector.js";
import StandartObject from "../standartObject.js";

export default class AccentPoint extends StandartObject {
  radius = 200;
  oX = this._x;
  oY = this._y;

  constructor(x, y, radius=200) {
    super(x, y);

    this.radius = radius;
  }

  draw(canvas, ctx, toCanvas, style) {
    super.draw(canvas, ctx, toCanvas, style);

    ctx.strokeStyle = style.getPropertyValue("--accent");
    ctx.lineWidth = 20;

    ctx.beginPath();
    ctx.arc(this._x, this._y, this.radius, 0.05 * Math.PI, 0.45 * Math.PI, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this._x, this._y, this.radius, 0.55 * Math.PI, 0.95 * Math.PI, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this._x, this._y, this.radius, 1.05 * Math.PI, 1.45 * Math.PI, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this._x, this._y, this.radius, 1.55 * Math.PI, 1.95 * Math.PI, false);
    ctx.stroke();

    const dir = point(this._x - this.oX, this._y - this.oY);
    const dir_norm = point(() => dir / dir.length);

    ctx.setLineDash([140, 280])
    ctx.beginPath();
    ctx.moveTo(this.oX, this.oY);
    ctx.lineTo(
      this._x - dir_norm.x * this.radius,
      this._y - dir_norm.y * this.radius
    )
    ctx.stroke()
    ctx.setLineDash([])

    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(this._x - 20, this._y);
    ctx.lineTo(this._x + 20, this._y);
    ctx.moveTo(this._x, this._y - 20);
    ctx.lineTo(this._x, this._y + 20);
    ctx.stroke();
  }

  moveTo(x, y, oX, oY) {
    super.moveTo(x, y);

    this.oX = oX || x;
    this.oY = oY || y;
  }

  save(realParent=null) {
    return {
      ...super.save(realParent),
      size: this.size,
    }
  }

  load(data, loadChildren=false) {
    super.load(data, loadChildren);
    this.size = data.size;
  } 
}

registerClass(AccentPoint);