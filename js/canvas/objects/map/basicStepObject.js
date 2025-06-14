import env from "../../../enviroments/env.js";
import { registerClass } from "../../../save&load/objectCollector.js";
import StandartObject from "../standartObject.js";

export default class BasicStepObject extends StandartObject {
  _step = 6;
  _livetime = 0;

  constructor(x, y, step) {
    super(x, y);
    this._step = step || env.STEP;
  }

  next() {
    this._livetime += this._step;

    for (let i of Object.keys(this.children)) {
      this.children[i].next && this.children[i].next(this);
    }
  }

  getOverridableValues() {
    return [
      ...super.getOverridableValues(),
      {
        name: "step",
        type: "number",
        current: () => this._step,
        func: (val) => {
          this._y = val;
        },
      },
    ];
  }
  

  save(realParent = null) {
    return {
      ...super.save(realParent),
      step: this._step,
      livetime: this._livetime,
    };
  }

  load(data, loadChildren = false) {
    super.load(data, false);
    this._step = data.step;
    this._livetime = data.livetime;

    loadChildren && super.loadChildren(data);
  }
}

registerClass(BasicStepObject);
