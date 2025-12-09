import { EVENTS } from "../../../../../../events.js";
import { registerClass } from "../../../../../../save&load/objectCollector.js";
import { registerSteps } from "../../../step/stepInfoCollector.js";
import SubgridObject from "../subgridObject.js";

export default class ShellSubgridObject extends SubgridObject {
  isCollided = false;

  physicsSimulationStep(step, dt, objectsData) {
    if (this.isCollided) return;

    if (this.currentCharacteristics.dynamic.hp.hull <= 0) {
      this.isCollided = true;
      this.visible = false;

      return {
        delete: true
      };
    }

    const data = super.physicsSimulationStep(step, dt, objectsData);

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
    let data = super.finalize(objectsData);

    const selfDestruct = this.currentCharacteristics.constant.body.subgrid?.self_destruct_in ?? 24;

    if (
      this._livetime >= selfDestruct ||
      this.currentCharacteristics.dynamic.hp.hull <= 0 ||
      this.isCollided
    ) {
      document.dispatchEvent(
        new CustomEvent(EVENTS.MAP.DELETE, {
          detail: {
            id: this.id,
          },
        })
      );
    }

    return data;
  }
}

registerClass(ShellSubgridObject);
registerSteps(ShellSubgridObject, 0, []);
