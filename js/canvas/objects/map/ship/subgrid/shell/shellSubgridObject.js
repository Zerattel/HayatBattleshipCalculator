import { EVENTS } from "../../../../../../events.js";
import { registerClass } from "../../../../../../save&load/objectCollector.js";
import { registerSteps } from "../../../step/stepInfoCollector.js";
import SubgridObject from "../subgridObject.js";

export default class ShellSubgridObject extends SubgridObject {
  isCollided = false;

  physicsSimulationStep(step, dt, objectsData) {
    const data = super.physicsSimulationStep(step, dt, objectsData);

    if (this.isCollided || !this.active) return data;

    if (this.currentCharacteristics.dynamic.hp.hull <= 0) {
      this.isCollided = true;
      this.visible = false;

      return {
        delete: true
      };
    }

    const collisions = objectsData._physics_collisions || [];
    for (const c of collisions) {
      if (c.a === this.id || c.b === this.id) {
        this.isCollided = true;
        this.visible = false;

        return {
          delete: true
        };
      }
    }

    return data;
  }

  finalize(objectsData) {
    const selfDestruct = this.currentCharacteristics.constant.body.subgrid?.self_destruct_in ?? 24;

    this.kill = 
      this.kill                                         ||
      this._livetime >= selfDestruct                    ||
      this.currentCharacteristics.dynamic.hp.hull <= 0  ||
      this.isCollided

    return super.finalize(objectsData);
  }
}

registerClass(ShellSubgridObject);
registerSteps(ShellSubgridObject, 0, []);
