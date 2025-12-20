import { registerClass } from "../../../../../../save&load/objectCollector.js";
import { registerSteps } from "../../../step/stepInfoCollector.js";
import SubgridObject from "../subgridObject.js";

export default class DroneObject extends SubgridObject {
  
}

registerClass(DroneObject);
registerSteps(DroneObject, 1, []);