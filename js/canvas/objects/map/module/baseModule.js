import { clamp } from "../../../../../libs/clamp.js";
import copy from "../../../../../libs/copy.js";
import { mergeDeep } from "../../../../../libs/deepMerge.js";
import { baseModuleCharacteristics } from "../../../../../libs/hayat/modules.js";

export default class BaseModule {
  characteristics = copy(baseModuleCharacteristics);

  /** offline / online / active / overload */
  state = "online";

  constructor(data) {
    this.characteristics = mergeDeep(this.characteristics, data)
  }

  get fullType() {
    return this.characteristics.main.type + " | " + this.characteristics.main.category;
  }

  applyModifiers(mods, activeModules) {
    const interference = this.characteristics.interference * (activeModules[this.fullType] - 1);

    for (let mod of this.characteristics.modificators[this.state]) {
      const modif = mod.modificator * (mod.isAffectedByInterference ? clamp(1 - interference, 0, 1) : 1);

      if (mod.characteristic in mods[mod.target][mod.modificationType]) {
        mods[mod.target][mod.modificationType][mod.characteristic] += modif;
      } else {
        mods[mod.target][mod.modificationType][mod.characteristic] = modif;
      }
    }

    return mods;
  }
}