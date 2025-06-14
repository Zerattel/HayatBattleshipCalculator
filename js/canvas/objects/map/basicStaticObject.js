import { registerClass } from "../../../save&load/objectCollector.js";
import BasicStepObject from "./basicStepObject.js";

export default class BasicStaticObject extends BasicStepObject {
  constructor(x, y) {
    super(x, y);
  }
}

registerClass(BasicStaticObject)