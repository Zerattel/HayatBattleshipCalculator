import { load } from "../../save&load/load.js";
import { registerClass } from "../../save&load/objectCollector.js";

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
    object.id = id;
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

  save(realParent=null) {
    return {
      class: this.constructor.name,
      x: this._x,
      y: this._y,
      visible: this.visible,
      id: this.id,
      parent: realParent == null ? null : this.parent == realParent ? 'inherted' : this.parent.id,
      children: Object.keys(this.children).reduce((acc, v) => {
        acc[v] = this.children[v].save(this);

        return acc;
      }, {})
    }
  }

  load(data, loadChildren=true) {
    this._x = data.x;
    this._y = data.y;
    this.visible = data.visible;

    if (loadChildren) this.loadChildren(data);
  }

  // Рекурсивно загружаем детей
  loadChildren(data) {
    for (let i of Object.keys(data.children)) {
      load(i, data.children[i], this)
    }
  }
}

registerClass(StandartObject)