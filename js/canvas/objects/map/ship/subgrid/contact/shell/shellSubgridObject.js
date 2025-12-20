import { EVENTS } from "../../../../../../../events.js";
import { registerClass } from "../../../../../../../save&load/objectCollector.js";
import { registerSteps } from "../../../../step/stepInfoCollector.js";
import ContactSubgridObject from "../contactSubgridObject.js";
import SubgridObject from "../../subgridObject.js";

export default class ShellSubgridObject extends ContactSubgridObject {
  static LOAD_FALLBACK = {
    ...super.LOAD_FALLBACK,
    contactOptions: {
      hide: false,
      destroy: false,
    }
  }

  static LOAD_CRASH = new Set([
    ...super.LOAD_CRASH,
  ]);
  

  isCollided = false;
  contactOptions = {
    hide: false,
    destroy: false,
  }
}

registerClass(ShellSubgridObject);
registerSteps(ShellSubgridObject, 0, []);
