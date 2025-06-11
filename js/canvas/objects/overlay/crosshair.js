import StandartObject from "../standartObject.js";

export default class CrosshairObject extends StandartObject {
  size = 100;

  constructor(x, y, size=100) {
    super(x, y);

    this.size = size;
  }

  draw(canvas, ctx, toCanvas, style) {
    super.draw(canvas, ctx, toCanvas, style);

    ctx.strokeStyle = style.getPropertyValue("--main");
    ctx.lineWidth = 20;

    const x = toCanvas(this._x);
    const y = toCanvas(this._y);

    ctx.strokeRect(
      x - this.size / 2,
      y - this.size / 2,
      this.size,
      this.size
    );

    ctx.setLineDash([100, 200]);
    ctx.beginPath();

    ctx.moveTo(x, 0);
    ctx.lineTo(x, y - this.size / 2);

    ctx.moveTo(x, y + this.size / 2);
    ctx.lineTo(x, canvas.height);

    ctx.moveTo(0, y);
    ctx.lineTo(x - this.size / 2, y);

    ctx.moveTo(x + this.size / 2, y);
    ctx.lineTo(canvas.width, y);

    ctx.stroke();
    ctx.setLineDash([]);
  }
}
