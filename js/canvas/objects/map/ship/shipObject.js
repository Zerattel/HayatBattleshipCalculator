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
import { log } from "../../../../controls/step-logs/log.js";
import { load } from "../../../../save&load/load.js";
import { registerClass } from "../../../../save&load/objectCollector.js";
import BasicMovingObject from "../step/basicMovingObject.js";
import { registerSteps } from "../step/stepInfoCollector.js";

export default class ShipObject extends BasicMovingObject {
  baseCharacteristics = copy(baseBattleshipCharacteristics);
  currentCharacteristics = copy(baseBattleshipCharacteristics);

  externalModules = [];
  internalModules = [];
  otherModules = [];

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
    return [...this.externalModules, ...this.internalModules, ...this.otherModules];
  }

  typeToModules(type) {
    return {
      'ext': this.externalModules,
      'int': this.internalModules,
      'otr': this.otherModules,
      'all': this.allModules,
    }[type]
  }

  //region step

  next() {
    let data = super.next();

    log(this.path, `next | processing modules`);

    for (let m of this.allModules) {
      data = {
        ...data,
        ...m.next()
      }
    }

    return data;
  }

  step(index, objectsData) {
    let data = super.step(index, objectsData);

    log(this.path, `step ${index} | processing modules`);

    for (let m of this.allModules) {
      data = {
        ...data,
        ...m.step(index, objectsData)
      }
    }

    if (index == 0) {
      this.recalculateCharacteristics();

      const c = this.currentCharacteristics;

      let heating = c.constant.heating;
      let ohDamage = 0;

      if (c.dynamic.temperature > c.constant.temperature) {
        ohDamage = overheatDamage(
          c.constant.hp.hull,
          c.dynamic.temperature,
          c.constant.temperature
        );
      }

      let barrierRegen = passiveBarrierRegeneration(
        c.constant.barrier,
        c.dynamic.hp.barrier,
        c.constant.hp.barrier
      )

      let generation = c.constant.capacitor.generation;

      c.dynamic.temperature += heating;
      c.dynamic.hp.hull     -= ohDamage;
      c.dynamic.hp.barrier  += barrierRegen;
      c.dynamic.charge      += generation;

      log(this.path, `step ${index} | statsChange (no clamp):<br>
                       ------ | Heating: ${heating}<br>
                       ------ | Overheat Damage: ${ohDamage}<br>
                       ------ | Barrier Regen: ${barrierRegen}<br>
                       ------ | Generation: ${generation}`);

      this.currentCharacteristics = clampCharacteristics(c, battleshipCharacteristicsClampRules);
    }

    return data;
  }

  finalize(objectsData) {
    let data = super.finalize(objectsData);

    log(this.path, `finalize | processing modules`);

    for (let m of this.allModules) {
      data = {
        ...data,
        ...m.finalize(objectsData)
      }
    }

    return data;
  }

  //region characteristics

  getOverridableValues() {
    return [
      ...super.getOverridableValues(),
      {
        name: "barrier",
        type: "number",
        current: () => Math.round(this.currentCharacteristics.dynamic.hp.barrier * 1000) / 1000,
        func: (val) => {
          this.currentCharacteristics.dynamic.hp.barrier = +val;
        },
      },
      {
        name: "armor",
        type: "number",
        current: () => Math.round(this.currentCharacteristics.dynamic.hp.armor * 1000) / 1000,
        func: (val) => {
          this.currentCharacteristics.dynamic.hp.armor = +val;
        },
      },
      {
        name: "hull",
        type: "number",
        current: () => Math.round(this.currentCharacteristics.dynamic.hp.hull * 1000) / 1000,
        func: (val) => {
          this.currentCharacteristics.dynamic.hp.hull = +val;
        },
      },
      {
        name: "temperature",
        type: "number",
        current: () => Math.round(this.currentCharacteristics.dynamic.temperature * 1000) / 1000,
        func: (val) => {
          this.currentCharacteristics.dynamic.temperature = +val;
        },
      },
      {
        name: "charge",
        type: "number",
        current: () => Math.round(this.currentCharacteristics.dynamic.charge * 1000) / 1000,
        func: (val) => {
          this.currentCharacteristics.dynamic.charge = +val;
        },
      },
    ]
  }

  getChildrenWithOverridableValues() {
    return [
      ...super.getChildrenWithOverridableValues(),
      {
        id: 'externalModules',
        children: this.externalModules.map(v => ({
          id: v.characteristics.main.name,
          getValues: () => v.getOverridableValues(),
          children: [],
        })),
      },
      {
        id: 'internalModules',
        children: this.internalModules.map(v => ({
          id: v.characteristics.main.name,
          getValues: () => v.getOverridableValues(),
          children: [],
        })),
      },
      {
        id: 'otherModules',
        children: this.otherModules.map(v => ({
          id: v.characteristics.main.name,
          getValues: () => v.getOverridableValues(),
          children: [],
        })),
      },
    ]
  }


  calculateModifiers(externalEffectCalculation=true) {
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

    if (externalEffectCalculation) {
      const event = new CustomEvent('calculateModifiers', {
        detail: {
          ship: this,
          mods: {
            number: {},
            percent: {},
          },
        }
      });
      document.dispatchEvent(event);

      for (let [m, v] of Object.entries(event.detail.mods.number)) {
        if (m in mods.this.number) {
          mods.this.number[m] += v;
        } else {
          mods.this.number[m] = v;
        }
      }

      for (let [m, v] of Object.entries(event.detail.mods.percent)) {
        if (m in mods.this.percent) {
          mods.this.percent[m] += v;
        } else {
          mods.this.percent[m] = v;
        }
      }
    }

    return mods;
  }

  recalculateCharacteristics() {
    const mods = this.calculateModifiers();

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
  }

  //region modules

  addModule(module, type='int') {
    module.uuid = uuidv4();
    this.typeToModules(type).push(module);

    this.recalculateCharacteristics();

    return module.uuid;
  }

  removeModule(id, type='all') {
    if (typeof id === "number") {
      this.typeToModules(type).splice(id, 1);
    } else {
      if (type != 'all') {
        const _id = this.typeToModules(type).findIndex((v) => v.uuid == id);

        if (_id != -1) this.typeToModules(type).splice(_id, 1);
        else return false;
      } else {
        return this.removeModule(id, 'int') 
                ? true 
                : this.removeModule(id, 'ext') 
                  ? true
                  : this.removeModule(id, 'otr')
                    ? true
                    : false
      }
    }

    this.recalculateCharacteristics();
    return true;
  }

  getModule(id, type='all') {
    return this.typeToModules(type).find((v) => v.uuid == id);
  }

  callModule(id, func, type='int', recalculate=true) {
    if (typeof id === "number") {
      func(this.typeToModules(type)[id], this);
    } else {
      const obj = this.getModule(id, type);

      if (obj) func(obj, this);
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
      otherModules:    this.otherModules.map((v) => v.save()),
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
    this.otherModules    = data.otherModules.map((v) => load("", v, "module"));

    this.recalculateCharacteristics();

    loadChildren && super.loadChildren(data);
  }
}

registerClass(ShipObject);
registerSteps(ShipObject, 1, []);
