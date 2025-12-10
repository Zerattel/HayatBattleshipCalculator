import { ObjectConnection } from "../../../../../../libs/connection.js";
import { objectFromPath } from "../../../../../../libs/pathResolver.js";
import { registerClass } from "../../../../../save&load/objectCollector.js";
import { objects } from "../../../../map.js";
import { registerSteps } from "../../step/stepInfoCollector.js";
import ShipObject from "../shipObject.js";

export default class SubgridObject extends ShipObject {
  controlledBy = new ObjectConnection(() => objects);


  constructor(x, y, direction, velocity, controlledBy = null, battleshipChars = {}) {
    super(x, y, direction, velocity, battleshipChars);
    this.controlledBy.Connection = controlledBy;
  }


  save(realParent = null) {
    return {
      ...super.save(realParent),
      controlledBy: this.controlledBy.Connection?.path ?? null,
    };
  }

  load(data, loadChildren = false) {
    super.load(data, false);
    
    this.controlledBy.storeConnection(data.controlledBy ?? null);

    loadChildren && super.loadChildren(data);
  }

  afterLoad() {
    this.controlledBy.forceLoadConnection(); // загружаем как объект

    super.afterLoad();
  }
}

registerClass(SubgridObject);
registerSteps(SubgridObject, 1, []);