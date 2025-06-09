import StandartObject from "../standartObject.js";

export default class BasicStepObject extends StandartObject {
  _step = 6;
  _livetime = 0;

  constructor(x, y, step) {
    super(x, y);
    this._step = step || 6;
  }

  next() {
    this._livetime += this._step;

    for (let i of Object.keys(this.children)) {
      this.children[i].next && this.children[i].next(this);
    }
  }
}