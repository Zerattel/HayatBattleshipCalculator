import { clampCharacteristics } from "../../../../../libs/clamp.js";
import copy from "../../../../../libs/copy.js";
import { mergeDeep } from "../../../../../libs/deepMerge.js";
import { getByPath } from "../../../../../libs/getByPath.js";
import {
  baseBattleshipCharacteristics,
  battleshipCharacteristicsClampRules,
  overheatDamage,
  passiveBarrierRegeneration,
  tonnageToAcceleration,
  tonnageToCaptureRange,
  tonnageToManeuverabilityBonus,
} from "../../../../../libs/hayat/battleships.js";
import { uuidv4 } from "../../../../../libs/uuid.js";
import { load } from "../../../../save&load/load.js";
import { registerClass } from "../../../../save&load/objectCollector.js";
import BasicMovingObject from "../basicMovingObject.js";

export default class ShipObject extends BasicMovingObject {
  baseCharacteristics = copy(baseBattleshipCharacteristics);
  currentCharacteristics = copy(baseBattleshipCharacteristics);

  externalModules = [];
  internalModules = [];

  constructor(x, y, direction, velocity, battleshipChars = {}) {
    super(x, y, direction, velocity);

    this.baseCharacteristics = mergeDeep(this.baseCharacteristics, battleshipChars);

    this.baseCharacteristics.constant.capture_range =
      tonnageToCaptureRange[this.baseCharacteristics.constant.body.tonnage];
    this.baseCharacteristics.constant.maneuverability +=
      tonnageToManeuverabilityBonus[this.baseCharacteristics.constant.body.tonnage];
    this.baseCharacteristics.constant.acceleration =
      tonnageToAcceleration[this.baseCharacteristics.constant.body.tonnage];

    this.currentCharacteristics = copy(this.baseCharacteristics);
  }

  get allModules() {
    return [...this.externalModules, ...this.internalModules];
  }

  //region step

  next() {
    super.next();

    const c = this.currentCharacteristics;

    c.dynamic.temperature += c.constant.heating;

    if (c.dynamic.temperature > c.constant.temperature) {
      c.dynamic.hp.hull -= overheatDamage(
        c.constant.hp.hull,
        c.dynamic.temperature,
        c.constant.temperature
      );
    }

    c.dynamic.hp.barrier += passiveBarrierRegeneration(
      c.constant.barrier,
      c.dynamic.hp.barrier,
      c.constant.hp.barrier
    )

    c.dynamic.charge += c.constant.capacitor.generation;

    this.currentCharacteristics = clampCharacteristics(c, battleshipCharacteristicsClampRules);
  }

  //region characteristics

  recalculateCharacteristics() {
    const activeModules = this.allModules.reduce((acc, v) => {
      if (v.fullType in acc) {
        acc[v.fullType] += 1;
      } else {
        acc[v.fullType] = 1;
      }

      return acc;
    }, {});

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
    };

    for (let mod of this.allModules) {
      mods = mod.applyModifiers(mods, activeModules);
    }

    this.currentCharacteristics = mergeDeep(copy(this.baseCharacteristics), {
      dynamic: this.currentCharacteristics.dynamic,
    });

    for (let [path, number] of Object.entries(mods.this.number)) {
      const [a, l] = getByPath(this.currentCharacteristics, path);
      a[l] += number;
    }

    for (let [path, percent] of Object.entries(mods.this.percent)) {
      const [a, l] = getByPath(this.currentCharacteristics, path);
      a[l] *= percent;
    }

    this.currentCharacteristics = clampCharacteristics(
      this.currentCharacteristics,
      battleshipCharacteristicsClampRules
    );

    console.log(this.currentCharacteristics, mods, activeModules);
  }

  //region modules

  addModule(module, isExternal = false) {
    module.uuid = uuidv4();

    if (isExternal) {
      this.externalModules.push(module);
    } else {
      this.internalModules.push(module);
    }

    this.recalculateCharacteristics();

    return module.uuid;
  }

  removeModule(id, isExternal = false) {
    if (typeof id === "number") {
      if (isExternal) {
        this.externalModules.splice(id, 1);
      } else {
        this.internalModules.splice(id, 1);
      }
    } else {
      if (isExternal) {
        const _id = this.externalModules.findIndex((v) => v.uuid == id);

        if (_id != -1) this.externalModules.splice(_id, 1);
      } else {
        const _id = this.internalModules.findIndex((v) => v.uuid == id);

        if (_id != -1) this.internalModules.splice(_id, 1);
      }
    }

    this.recalculateCharacteristics();
  }

  callModule(id, func, isExternal = false, recalculate = true) {
    if (typeof id === "number") {
      if (isExternal) {
        func(this.externalModules[id], this);
      } else {
        func(this.internalModules[id], this);
      }
    } else {
      if (isExternal) {
        const _id = this.externalModules.findIndex((v) => v.uuid == id);

        if (_id != -1) func(this.externalModules[_id], this);
      } else {
        const _id = this.internalModules.findIndex((v) => v.uuid == id);

        if (_id != -1) func(this.internalModules[_id], this);
      }
    }

    recalculate && this.recalculateCharacteristics();
  }

  //region save

  save(realParent = null) {
    return {
      ...super.save(realParent),
      baseCharacteristics: this.baseCharacteristics,
      dynamicCharacteristics: this.currentCharacteristics.dynamic,
      externalModules: this.externalModules.map((v) => v.save()),
      internalModules: this.internalModules.map((v) => v.save()),
    };
  }

  load(data, loadChildren = false) {
    super.load(data, false);
    this.baseCharacteristics = data.baseCharacteristics;
    this.currentCharacteristics = mergeDeep(copy(this.baseCharacteristics), {
      dynamic: data.dynamicCharacteristics,
    });

    this.externalModules = data.externalModules.map((v) => load("", v, "module"));
    this.internalModules = data.internalModules.map((v) => load("", v, "module"));

    this.recalculateCharacteristics();

    loadChildren && super.loadChildren(data);
  }
}

registerClass(ShipObject);
