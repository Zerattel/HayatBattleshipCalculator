import StandartObject from "../standartObject.js";
import { saveFunction } from "../../../save&load/save.js";
import { loadFunction } from "../../../save&load/load.js";
import { registerClass } from "../../../save&load/objectCollector.js";

export default class BasicDataHud extends StandartObject {
  data = [];
  length = 300;
  padding = 100;
  direction = 45;

  constructor(data, length, padding, direction) {
    super()

    this.data = data || [];
    this.length = length || 400;
    this.padding = padding || 150;
    this.direction = direction || 60;
  }

  draw(canvas, ctx, toCanvas, style) {
    super.draw(canvas, ctx, toCanvas, style);

    if (!this.parent) return;

    ctx.strokeStyle = style.getPropertyValue("--hud");
    ctx.lineWidth = 7;

    ctx.font = "70px Consolas";
    ctx.textAlign = "left";
    ctx.textBaseline = "hanging";
    ctx.fillStyle = style.getPropertyValue("--hud");

    let text = []
    let height = 0
    for (let i of this.data) {
      text.push(i.func(this))
      height += 80
    }

    const x_offset = Math.sin((this.direction / 180) * Math.PI);
    const y_offset = Math.cos((this.direction / 180) * Math.PI);

    const par_x = toCanvas(this.parent._x)
    const par_y = toCanvas(this.parent._y)

    ctx.beginPath();

    ctx.moveTo(par_x + x_offset * this.padding, par_y + y_offset * this.padding);
    ctx.lineTo(
      par_x + x_offset * this.padding + x_offset * this.length,
      par_y + y_offset * this.padding + y_offset * this.length
    );
    ctx.moveTo(
      par_x + x_offset * this.padding + x_offset * this.length + x_offset * this.padding,
      par_y + y_offset * this.padding + y_offset * this.length + y_offset * this.padding - height/2
    );
    ctx.lineTo(
      par_x + x_offset * this.padding + x_offset * this.length + x_offset * this.padding,
      par_y + y_offset * this.padding + y_offset * this.length + y_offset * this.padding + height/2
    );

    ctx.stroke()

    let y = par_y + y_offset * this.padding + y_offset * this.length + y_offset * this.padding - height/2;
    let x = par_x + x_offset * this.padding + x_offset * this.length + x_offset * this.padding + 50;
    for (let [i, str] of Object.entries(text)) { 
      ctx.fillText(str, x, y + 80 * Number(i))
    }
  }


  getOverridableValues() {
    return [
      ...super.getOverridableValues(),
      {
        name: "length",
        type: "number",
        current: () => this.length,
        func: (val) => {
          this.length = +val;
        },
      },
      {
        name: "padding",
        type: "number",
        current: () => this.padding,
        func: (val) => {
          this.padding = +val;
        },
      },
      {
        name: "direction",
        type: "number",
        current: () => this.direction,
        func: (val) => {
          this.direction = +val;
        },
      },
    ];
  }


  save(realParent=null) {
    return {
      ...super.save(realParent),
      data: this.data.map(v => ({ func: saveFunction(v.func) })),
      length: this.length,
      padding: this.padding,
      direction: this.direction,
    }
  }

  load(data, loadChildren=false) {
    super.load(data, false);
    this.data = data.data.map(v => ({ func: loadFunction(v.func) }))
    this.length = data.length;
    this.padding = data.padding;
    this.direction = data.direction;

    loadChildren && super.loadChildren(data);
  } 
}

registerClass(BasicDataHud)