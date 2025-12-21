import { registerClass } from "../../../../../../save&load/objectCollector.js";
import { objects } from "../../../../../map.js";
import SIMULATION_STATES, { parceSimulationState } from "../../../step/simulationStates.constant.js";
import { registerSteps } from "../../../step/stepInfoCollector.js";
import ContactSubgridObject from "./contactSubgridObject.js";

export default class ExplosiveSubgridObject extends ContactSubgridObject {
  physicsSimulationStep(step, dt, objectsData) {
    const data = super.physicsSimulationStep(step, dt, objectsData);
    if (this.isCollided || !this.active) return data;

    const pf = this.currentCharacteristics.constant.body.subgrid.poximity_fuse;
    if (pf) {
      const apf = pf.active;
      
      if (!apf) return data;
      if ((apf.trigger_activation_delay ?? 0) - this._livetime - dt*step > 0) return data;

      const mdsqr = apf.min_distance * apf.min_distance;
      const layers = apf.triggers.layers ?? ['all'];
      const noLayerFilter = layers.includes('all');
      const minSize = apf.triggers.min_size ?? 0;

      for (let obj of Object.values(objects)) {
        const rx = obj._x - this._x;
        const ry = obj._y - this._y;
        const range = rx*rx + ry*ry - Math.pow(obj.size ?? 0, 2);

        if (range > mdsqr) continue;
        if ((obj.size ?? 0) < minSize) continue;
        if (noLayerFilter || (obj.layers).some(v => layers.includes(v))) {
          this.visible = false;
          this.destroy();

          return {
            delete: true
          };
        }
      }
    }

    return data;
  }

  applyExplosiveDamage() {
    const { radius, falloff, effect } 
      = this.currentCharacteristics.constant.body.subgrid.explosion 
      ?? { 
        radius: 10, 
        falloff: 2,  
        effect: {
          damage: {
            kinetic: 0,
            high_explosive: 100,
            electro_magnetic: 0,
            thermal: 50
          },
        }
      };

    
    for (let obj of Object.values(objects)) {
      if (!("applyDamage" in obj) || !("currentCharacteristics" in obj)) continue;

      const rx = obj._x - this._x;
      const ry = obj._y - this._y;
      const range = rx*rx + ry*ry - Math.pow(obj.size ?? 0, 2);

      if (range > (radius*radius)) continue;

      const mult = Math.pow(1 - Math.sqrt(range) / radius, falloff)

      if (effect.damage) {
        for (let [k, v] of Object.entries(effect.damage)) {
          if (!obj.currentCharacteristics.dynamic.recived_damage[k])
            obj.currentCharacteristics.dynamic.recived_damage[k] = 0;

          obj.currentCharacteristics.dynamic.recived_damage[k] += v * mult;
        }

        obj.applyDamage();
      }
      
      if (effect.temperature) {
        obj.currentCharacteristics.dynamic.temperature += effect.temperature * mult;
      }

      if (effect.charge) {
        obj.currentCharacteristics.dynamic.charge += effect.charge * mult;
      }

      if (effect.heal) {
        for (let [k, v] of Object.entries(effect.heal)) {
          obj.currentCharacteristics.dynamic.hp[k] += v * mult;
        }
      }
    }
  }

  onContact() {
    this.applyExplosiveDamage();
  }

  destroy() {
    if (parceSimulationState(this.state)[0] == SIMULATION_STATES.PHYSICS_SIMULATION) {
      this.applyExplosiveDamage();
    }

    super.destroy();
  }
}

registerClass(ExplosiveSubgridObject);
registerSteps(ExplosiveSubgridObject, 0, []);