import { EVENTS } from "../../../../../../../events.js";
import { registerClass } from "../../../../../../../save&load/objectCollector.js";
import { registerSteps } from "../../../../step/stepInfoCollector.js";
import ContactSubgridObject from "../contactSubgridObject.js";
import SubgridObject from "../../subgridObject.js";

export default class ShellSubgridObject extends ContactSubgridObject {
  isCollided = false;
  contactOptions = {
    hide: false,
    destroy: false,
  }
}

registerClass(ShellSubgridObject);
registerSteps(ShellSubgridObject, 0, []);
