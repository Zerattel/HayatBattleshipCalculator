import { objectFromPath } from "../../../../../../libs/pathResolver.js";
import { registerClass } from "../../../../../save&load/objectCollector.js";
import { objects } from "../../../../map.js";
import { registerSteps } from "../../step/stepInfoCollector.js";
import ShipObject from "../shipObject.js";

export default class SubgridObject extends ShipObject {
  _controlledBy = null;
  get controlledBy() {
    if (typeof _controlledBy === "string") {
      this._controlledBy = objectFromPath(objects, this._controlledBy);
    }

    return this._controlledBy;
  }
  set controlledBy(value) {
    if (typeof value === "string") {
      this._controlledBy = objectFromPath(objects, this._controlledBy);
    } else if (typeof value === "object") {
      this._controlledBy = value;
    } else if (!value) {
      this._controlledBy = null;
    }
  }


  constructor(x, y, direction, velocity, controlledBy = null, battleshipChars = {}) {
    super(x, y, direction, velocity, battleshipChars);
    this._controlledBy = controlledBy;
  }


  save(realParent = null) {
    return {
      ...super.save(realParent),
      controlledBy: this.controlledBy?.path ?? null,
    };
  }

  load(data, loadChildren = false) {
    super.load(data, false);
    
    this._controlledBy = data.controlledBy ?? null;

    loadChildren && super.loadChildren(data);
  }

  afterLoad() {
    this.controlledBy = this._controlledBy; // загружаем как объект

    super.afterLoad();
  }
}

registerClass(SubgridObject);
registerSteps(SubgridObject, 1, []);