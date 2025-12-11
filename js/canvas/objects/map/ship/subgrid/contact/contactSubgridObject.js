import { registerClass } from "../../../../../../save&load/objectCollector.js";
import { registerSteps } from "../../../step/stepInfoCollector.js";
import SubgridObject from "../subgridObject.js";

export default class ContactSubgridObject extends SubgridObject {
  isCollided = false;
  contactOptions = {
    hide: true,
    destroy: true,
  }


  onContact(collidedTargetId) {}

  physicsSimulationStep(step, dt, objectsData) {
    const data = super.physicsSimulationStep(step, dt, objectsData);

    if (this.isCollided || !this.active) return data;

    if (this.currentCharacteristics.dynamic.hp.hull <= 0) {
      this.visible = false;
      this.destroy();

      return {
        delete: true
      };
    }

    const collisions = objectsData._physics_collisions || [];
    for (const c of collisions) {
      if (c.a === this.id || c.b === this.id) {
        this.isCollided = true;
        this.visible = !this.contactOptions.hide;

        this.onContact(c.a === this.id ? c.b : c.a);
        if (this.contactOptions.destroy) this._kill = true;

        return {
          delete: this.contactOptions.hide
        };
      }
    }

    return data;
  }


  finalize(objectsData) {
    const selfDestruct = this.currentCharacteristics.constant.body.subgrid?.self_destruct_in ?? 24;

    this._kill ||= 
      this._livetime >= selfDestruct                    ||
      this.currentCharacteristics.dynamic.hp.hull <= 0
    
    this.isCollided = false;

    return super.finalize(objectsData);
  }


  save(realParent = null) {
    return {
      ...super.save(realParent),
      contactOptions: this.contactOptions,
    };
  }

  load(data, loadChildren = false) {
    super.load(data, false);
    
    this.contactOptions ??= data.contactOptions;

    loadChildren && super.loadChildren(data);
  }
}

registerClass(ContactSubgridObject);
registerSteps(ContactSubgridObject, 0, []);