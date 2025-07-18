import { registerClass } from "../../../../save&load/objectCollector.js";
import BasicStepObject from "./basicStepObject.js";
import { registerSteps } from "./stepInfoCollector.js";

export default class BasicStaticObject extends BasicStepObject {
  constructor(x, y) {
    super(x, y);
  }
}

registerClass(BasicStaticObject)
registerSteps(BasicStaticObject, 0, [])