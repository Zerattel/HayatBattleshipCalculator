import env from "../../../enviroments/env.js";
import { load } from "../../../save&load/load.js";
import { registerClass } from "../../../save&load/objectCollector.js";
import StandartObject from "../standartObject.js";

export default class BasicStepObject extends StandartObject {
  _step = 6;
  _livetime = 0;

  tasks = [];

  constructor(x, y, step) {
    super(x, y);
    this._step = step || env.STEP;
  }

  next() {
    this._livetime += this._step;

    for (let i of Object.keys(this.children)) {
      this.children[i].next && this.children[i].next(this);
    }

    for (let i in this.tasks) {
      if (!this.tasks[i].do(this)) delete this.tasks[i];
    }
    this.tasks = this.tasks.filter(v => v);
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


  newTask(task, overrideWithSameId=false) {
    if (overrideWithSameId) {
      const index = this.tasks.findIndex(v => v.id == task.id);

      if (index != -1) this.tasks.splice(index, 1);
    }

    this.tasks.push(task);
  }

  deleteTask(id) {
    const index = this.tasks.findIndex(v => v.id == id);

    if (index != -1) this.tasks.splice(index, 1);
  }
  

  save(realParent = null) {
    return {
      ...super.save(realParent),
      step: this._step,
      livetime: this._livetime,
      tasks: this.tasks.map(v => v.save()),
    };
  }

  load(data, loadChildren = false) {
    super.load(data, false);
    this._step = data.step;
    this._livetime = data.livetime;
    this.tasks = data.tasks.map(v => load('', v, "module"))

    loadChildren && super.loadChildren(data);
  }
}

registerClass(BasicStepObject);
