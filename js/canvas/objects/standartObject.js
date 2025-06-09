export default class StandartObject {
  _x = 0;
  _y = 0;
  visible = true;

  id = "";

  children = {};
  parent = null;

  constructor(x, y) {
    this._x = x || 0;
    this._y = y || 0;
  }

  draw(canvas, ctx, toCanvas, style) {
    for (let i of Object.keys(this.children)) {
      this.children[i].visible && this.children[i].draw(canvas, ctx, toCanvas, style);
    }
  }

  setChildren(id, object) {
    object.parent = this;
    this.children[id] = object;
  }

  deleteChildren(id) {
    delete this.children[id];
  }

  callChildren(id, func) {
    func(this.children[id], this);
  }

  moveTo(x, y) {
    this._x = x;
    this._y = y;
  }

  setVisible(v) {
    this.visible = v;
  }
}