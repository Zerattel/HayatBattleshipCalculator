import copy from "../../../../../libs/copy.js";
import { mergeDeep } from "../../../../../libs/deepMerge.js";
import { getByPath } from "../../../../../libs/getByPath.js";
import { baseBattleshipCharacteristics, tonnageToAcceleration, tonnageToCaptureRange, tonnageToManeuverabilityBonus } from "../../../../../libs/hayat/battleships.js";
import { load } from "../../../../save&load/load.js";
import BasicMovingObject from "../basicMovingObject.js";

export default class ShipObject extends BasicMovingObject {
  baseCharacteristics = copy(baseBattleshipCharacteristics);
  currentCharacteristics = copy(baseBattleshipCharacteristics);

  externalModules = [];
  internalModules = [];

  constructor(x, y, direction, velocity, battleshipChars={}) {
    super(x, y, direction, velocity);

    this.baseCharacteristics = mergeDeep(this.baseCharacteristics, battleshipChars);

    this.baseCharacteristics.constant.capture_range = tonnageToCaptureRange[this.baseCharacteristics.constant.body.tonnage];
    this.baseCharacteristics.constant.maneuverability += tonnageToManeuverabilityBonus[this.baseCharacteristics.constant.body.tonnage];
    this.baseCharacteristics.constant.acceleration = tonnageToAcceleration[this.baseCharacteristics.constant.body.tonnage];

    this.currentCharacteristics = copy(this.baseCharacteristics);
  }

  get allModules() {
    return [...this.externalModules, ...this.internalModules];
  }

  recalculateCharacteristics() {
    const activeModules = this.allModules.reduce((acc, v) => {
      if (v.fullType in acc) {
        acc[v.fullType] += 1;
      } else {
        acc[v.fullType] = 1;
      }

      return acc;
    }, {})

    let mods = {
      this: {
        number: {},
        percent: {},
      },
      target: {
        number: {},
        percent: {},
      },
      area: {
        number: {},
        percent: {},
      },
    }

    for (let mod of this.allModules) {
      mods = mod.applyModifiers(mods, activeModules);
    }

    this.currentCharacteristics = copy(this.baseCharacteristics);

    for (let [path, number] of Object.entries(mods.this.number)) {
      const [a, l] = getByPath(this.currentCharacteristics, path)
      a[l] += number;
    }

    for (let [path, percent] of Object.entries(mods.this.percent)) {
      const [a, l] = getByPath(this.currentCharacteristics, path)
      a[l] *= percent;
    }

    console.log(this.currentCharacteristics, mods, activeModules)
  }

  addModule(module, isExternal=false) {
    if (isExternal) {
      this.externalModules.push(module);
    } else {
      this.internalModules.push(module);
    }

    this.recalculateCharacteristics();
  }


  save(realParent = null) {
    return {
      ...super.save(realParent),
      baseCharacteristics: this.baseCharacteristics,
      externalModules: this.externalModules.map(v => v.save()),
      internalModules: this.internalModules.map(v => v.save()),
    };
  }

  load(data, loadChildren = false) {
    super.load(data, false);
    this.baseCharacteristics = data.baseCharacteristics;
    this.currentCharacteristics = copy(this.baseCharacteristics);

    this.externalModules = data.externalModules.map(v => load('', v, 'module'))
    this.internalModules = data.internalModules.map(v => load('', v, 'module'))

    recalculateCharacteristics();

    loadChildren && super.loadChildren(data);
  }
}