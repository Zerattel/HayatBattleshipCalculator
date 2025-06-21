import { point } from "../../../../../libs/vector/point.js";
import { registerClass } from "../../../../save&load/objectCollector.js";
import StandartObject from "../../standartObject.js";

export default class VectorHud extends StandartObject {
  settings = {
    directionLength: 500,
    showRDirection: true,
    showVDirection: true,
    showNextSteps: true,
  };

  constructor(settings = {}) {
    super(0, 0);

    this.settings = { ...this.settings, ...settings };
  }

  draw(canvas, ctx, toCanvas, style) {
    super.draw(canvas, ctx, toCanvas, style);

    if (!this.parent || !("_direction" in this.parent && "velocity" in this.parent)) return;

    ctx.lineWidth = 20;

    const x = toCanvas(this.parent._x);
    const y = toCanvas(this.parent._y);

    if (this.settings.showRDirection) {
      ctx.strokeStyle = style.getPropertyValue("--direction");
      const direction = point(
        Math.sin((this.parent._direction / 180) * Math.PI),
        Math.cos((this.parent._direction / 180) * Math.PI)
      );

      ctx.setLineDash([this.settings.directionLength / 10, this.settings.directionLength / 10]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + direction.x * this.settings.directionLength,
        y + direction.y * this.settings.directionLength
      );
      ctx.stroke();
    }

    if (this.parent.velocity.length >= 1 && this.settings.showNextSteps) {
      ctx.setLineDash([
        Math.abs((toCanvas(this.parent.velocity.length) * this.parent._step) / 16),
        Math.abs((toCanvas(this.parent.velocity.length) * this.parent._step) / 8),
      ]);
      ctx.lineWidth = 7;
      ctx.strokeStyle = style.getPropertyValue("--direction");
      ctx.fillStyle = style.getPropertyValue("--direction");
      ctx.beginPath();
      ctx.moveTo(x, y);

      let curx = x + toCanvas(this.parent.velocity.x) * this.parent._step,
        cury = y + toCanvas(this.parent.velocity.y) * this.parent._step;

      ctx.lineTo(curx, cury);
      ctx.fillRect(curx - 10, cury - 10, 20, 20);

      let step = 1;

      while (curx > 0 && curx < canvas.width && cury > 0 && cury < canvas.height) {
        step++;

        curx = x + toCanvas(this.parent.velocity.x) * this.parent._step * step;
        cury = y + toCanvas(this.parent.velocity.y) * this.parent._step * step;

        ctx.lineTo(curx, cury);
        ctx.fillRect(curx - 10, cury - 10, 20, 20);
      }
      ctx.stroke();
    }

    ctx.setLineDash([]);

    if (this.settings.showVDirection) {
      ctx.lineWidth = 20;
      ctx.strokeStyle = style.getPropertyValue("--velocity");

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + toCanvas(this.parent.velocity.x) * this.parent._step,
        y + toCanvas(this.parent.velocity.y) * this.parent._step
      );
      ctx.stroke();
    }
  }


  getOverridableValues() {
    return [
      ...super.getOverridableValues(),
      {
        name: "settings-directionLength",
        type: "number",
        current: () => this.settings.directionLength,
        func: (val) => {
          this.settings.directionLength = +val;
        },
      },
      {
        name: "settings-showRDirection",
        type: "checkbox",
        current: () => this.settings.showRDirection,
        func: (val) => {
          this.settings.showRDirection = val;
        },
      },
      {
        name: "settings-showVDirection",
        type: "checkbox",
        current: () => this.settings.showVDirection,
        func: (val) => {
          this.settings.showVDirection = val;
        },
      },
      {
        name: "settings-showNextSteps",
        type: "checkbox",
        current: () => this.settings.showNextSteps,
        func: (val) => {
          this.settings.showNextSteps = val;
        },
      },
    ];
  }


  save(realParent=null) {
    return {
      ...super.save(realParent),
      settings: this.settings,
    }
  }

  load(data, loadChildren=false) {
    super.load(data, false);
    this.settings = data.settings;

    loadChildren && super.loadChildren(data);
  } 
}

registerClass(VectorHud);