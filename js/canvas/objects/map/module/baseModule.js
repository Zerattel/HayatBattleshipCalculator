import { clamp } from "../../../../../libs/clamp.js";
import copy from "../../../../../libs/copy.js";
import { mergeDeep } from "../../../../../libs/deepMerge.js";
import { baseModuleCharacteristics } from "../../../../../libs/hayat/modules.js";
import { MODULES_CALCULATION_FUNCTIONS } from "../../../../../modules/modules.js";
import { log } from "../../../../controls/step-logs/log.js";
import { registerClass } from "../../../../save&load/objectCollector.js";
import MAP_OBJECTS_IDS from "../mapObjectsIds.constant.js";
import { registerSteps } from "../step/stepInfoCollector.js";

export default class BaseModule {
  characteristics = copy(baseModuleCharacteristics);

  /** offline / online / active / overload */
  state = "offline";
  previousState = "offline";

  uuid = "";
  parent = null;

  inOnlineSteps = 0;

  constructor(data = {}) {
    this.characteristics = mergeDeep(this.characteristics, data);
  }

  get fullType() {
    return this.characteristics.main.type + " | " + this.characteristics.main.category;
  }

  applyModifiers(mods, activeModules) {
    const interference = this.characteristics.interference * (activeModules[this.fullType] - 1);

    for (let mod of this.characteristics.modificators[this.state]) {
      let modif;
      if (typeof mod.modificator == "number") {
        modif = mod.modificator;
      } else {
        const module = this,
          parent = this.parent,
          target = this.parent.children[MAP_OBJECTS_IDS.CONTACT_CONTROLLER]?.target || null;

        let m = mod.modificator;
        mod.modificator
          .match(/<\[[^\]]+]>/g)
          .forEach((v) =>
            m = m.replace(v, `MODULES_CALCULATION_FUNCTIONS["${v.slice(2, -2)}"](module, parent, target)`)
          );
        console.log(m, mod.modificator.match(/<\[[^\]]+]>/g))
        modif = eval(m);
      }
      modif *= mod.isAffectedByInterference ? clamp(1 - interference, 0, 1) : 1;

      if (mod.characteristic in mods[mod.target][mod.modificationType]) {
        mods[mod.target][mod.modificationType][mod.characteristic] += modif;
      } else {
        mods[mod.target][mod.modificationType][mod.characteristic] = modif;
      }
    }

    return mods;
  }

  next() {
    if (this.previousState != this.state && this.state == "offline") {
      this.inOnlineSteps = 0;
    }

    if (["online", "active", "overload"].includes(this.state)) {
      this.inOnlineSteps += 1;
    }

    this.inOnlineSteps != 0 &&
      log(
        "module " + this.uuid + " " + this.characteristics.main.name,
        `next | in online for ${this.inOnlineSteps}`
      );
    this.previousState != this.state &&
      log(
        "module " + this.uuid + " " + this.characteristics.main.name,
        `next | state changed ${this.previousState} -> ${this.state}`
      );

    this.previousState = this.state;
  }

  step(index, objectsData) {}

  finalize(objectsData) {}

  setState(state) {
    if (!["offline", "online", "active", "overload"].includes(state)) {
      if (this.previousState != "offline") {
        this.previousState == this.state;
      }

      this.state = "offline";
      return;
    }

    if (this.previousState != this.state) {
      this.previousState == this.state;
    }
    this.state = state;
  }

  getOverridableValues() {
    return [
      {
        name: "state",
        type: "text",
        current: () => this.state,
        func: (val) => {
          this.setState(val);
        },
      },
      {
        name: "inOnlineSteps",
        type: "number",
        current: () => this.inOnlineSteps,
        func: (val) => {
          this.inOnlineSteps = val;
        },
      },
    ];
  }

  getChildrenWithOverridableValues(parent = "this") {
    return [];
  }

  save() {
    return {
      class: this.constructor.name,
      state: this.state,
      uuid: this.uuid,
      characteristics: this.characteristics,

      previousState: this.previousState,
      inOnlineSteps: this.inOnlineSteps,
    };
  }

  load(data) {
    this.characteristics = data.characteristics;
    this.uuid = data.uuid;
    this.state = data.state;
    this.previousState = data.previousState;
    this.inOnlineSteps = data.inOnlineSteps;
  }
}

registerClass(BaseModule);
registerSteps(BaseModule, 0, []);
