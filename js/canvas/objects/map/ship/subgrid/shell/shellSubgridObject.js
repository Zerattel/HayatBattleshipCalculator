import { EVENTS } from "../../../../../../events.js";
import { registerClass } from "../../../../../../save&load/objectCollector.js";
import { registerSteps } from "../../../step/stepInfoCollector.js";
import SubgridObject from "../subgridObject.js";

export default class ShellSubgridObject extends SubgridObject {
  finalize(objectsData) {
    let data = super.finalize(objectsData);

    const selfDestruct = this.currentCharacteristics.constant.body.subgrid?.self_destruct_in ?? 24;

    if (
      this._livetime >= selfDestruct ||
      this.currentCharacteristics.dynamic.hp.hull <= 0
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
