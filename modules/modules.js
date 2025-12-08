import BaseModule from "../js/canvas/objects/map/module/baseModule.js";
import ShipObject from "../js/canvas/objects/map/ship/shipObject.js";
import { calculateRelativeData } from "../js/controls/show_rdata.js";
import { log } from "../js/controls/step-logs/log.js";
import { updateLoading } from "../js/loading.js";
import { clamp } from "../libs/clamp.js";
import { getFullManeuverability } from "../libs/hayat/battleships.js";
import { point } from "../libs/vector/point.js";

let isReady = false;
let modules = {};
let onReady = () => {};
let setReadyFunction = (func) => {
  onReady = func;
};

export default function init() {
  const loadModules = async (list) => {
    const len = Object.keys(list).length;
    let amount = 0;
    updateLoading("modules", len, 0, 0);
    for (let [name, path] of Object.entries(list)) {
      const data = await (await fetch("./modules/" + path)).json();

      modules[name] = data;

      amount++;
      updateLoading("modules", len, 0, amount);
    }
  };

  fetch("./modules/modules.json")
    .then((response) => response.json())
    .then((v) => {
      loadModules(v)
        .then(() => {
          isReady = true;

          console.log(modules);

          onReady();
        })
        .catch((e) => {
          console.log(e);

          alert("Cannot load modules data!");
        });
    })
    .catch((e) => {
      console.log(e);

      alert("Cannot load modules paths!");
    });
}

export { isReady, modules, setReadyFunction };

/**
 * @type { Record<string, 
 * (
 *    modificator: {
 *      target: string,
 *      characteristic: string,
 *      modificationType: string,
 *      modificator: number | string,
 *      isAffectedByInterference: boolean
 *    }, 
 *    module: BaseModule,
 *    parent: ShipObject,
 *    target: ShipObject
 *  ) => number }
 */
const MODULES_CALCULATION_FUNCTIONS = {
  RENContactor: (modificator, module, parent, target) => {
    if (!target || !parent) return 0;

    const range = point(() => point(target._x, target._y) - point(parent._x, parent._y)).length;
    const EWRes = 1 - target.currentCharacteristics.constant.resistance.EW;
    const EWDist =
      target.currentCharacteristics.constant.modulemodifier.offence.EW.effective_distance_modifier;
    const EWMod =
      target.currentCharacteristics.constant.modulemodifier.offence.EW.EW_strenght_modifier;

    const num =
      module.characteristics.additionalInfo.baseDraining *
      (1 -
        clamp(
          (range - module.characteristics.additionalInfo.effectiveRange * EWDist) /
            (module.characteristics.additionalInfo.maxRange -
              module.characteristics.additionalInfo.effectiveRange),
          0,
          1
        )) *
      EWMod *
      EWRes;

    return num > 0 ? -num : 0;
  },

  LaserAttack: (modificator, module, parent, target) => {
    if (parent.state != "step 0" || module.functionsSharedData.perStep.processed) return 0;

    module.functionsSharedData.perStep.hit          = false;
    module.functionsSharedData.perStep.effectivness = 0;
    module.functionsSharedData.perStep.damage       = 0;
    module.functionsSharedData.perStep.heating      = 0;

    if (!target || !parent) return 0;

    const contactQuality = parent.dices.contactQuality;
    const resultAccuracy =
      contactQuality -
      getFullManeuverability(target.currentCharacteristics, target.dices.maneuvering);

    const { angularVelocity } = calculateRelativeData(parent, target);
    const angularPenalty =
      clamp(Math.abs(angularVelocity) / module.characteristics.additionalInfo.tracking - 0.75, 0, 0.3) / 0.3;

    const chance = clamp(0.5 + resultAccuracy * 0.15, 0, 1) * (1 - angularPenalty);
    const random = Math.random();

    if (random <= chance) {
      const range = point(() => point(target._x, target._y) - point(parent._x, parent._y)).length;
      const effectivness =
        1 -
        clamp(
          (range - module.characteristics.additionalInfo.effectiveRange) /
            (module.characteristics.additionalInfo.maxRange -
              module.characteristics.additionalInfo.effectiveRange),
          0,
          1
        );

      module.functionsSharedData.perStep.hit = true;
      module.functionsSharedData.perStep.effectivness = effectivness;
      module.functionsSharedData.perStep.damage =
        module.characteristics.additionalInfo.baseDamage * effectivness;
      module.functionsSharedData.perStep.heating =
        module.characteristics.additionalInfo.targetHeating * effectivness;

      log(
        module.path,
        `function | (data applied only in step calculation)<br>
-------- | ${random} <= ${chance}, hit calculated<br>
-------- | ${module.functionsSharedData.perStep.damage}dmg ${module.functionsSharedData.perStep.heating}heat`
      );
    } else {
      log(
        module.path,
        `function | (data applied only in step calculation)<br>
-------- | ${random} > ${chance}, missed`
      );
    }

    module.functionsSharedData.perStep.processed = true;
    return 0;
  },
  BallisticAttack: (modificator, module, parent, target) => {
    if (parent.state != "step 0" || module.functionsSharedData.perStep.processed) return 0;

    module.functionsSharedData.perStep.hit     = false;
    module.functionsSharedData.perStep.damage  = 0;
    module.functionsSharedData.perStep.heating = 0;

    if (!target || !parent) return 0;

    const contactQuality = parent.dices.contactQuality;

    const range = point(() => point(target._x, target._y) - point(parent._x, parent._y)).length;
    const penalty =
      ((range - module.characteristics.additionalInfo.effectiveRange) /
        module.characteristics.additionalInfo.penaltyStep) *
      module.characteristics.additionalInfo.penalty;

    const resultAccuracy =
      contactQuality -
      getFullManeuverability(target.currentCharacteristics, target.dices.maneuvering) -
      (penalty > 0 ? penalty : 0);

    const { angularVelocity } = calculateRelativeData(parent, target);
    const angularPenalty =
      clamp(Math.abs(angularVelocity) / module.characteristics.additionalInfo.tracking - 0.75, 0, 0.3) / 0.3;

    const chance = clamp(0.5 + resultAccuracy * 0.15, 0, 1) * (1 - angularPenalty);
    const random = Math.random();

    if (random <= chance) {
      
      module.functionsSharedData.perStep.damage  = module.characteristics.additionalInfo.baseDamage * parent.currentCharacteristics.constant.modulemodifier.offence.ballistic.damage_modifier ;
      module.functionsSharedData.perStep.heating = module.characteristics.additionalInfo.targetHeating;
      module.functionsSharedData.perStep.hit = true;
      log(
        module.path,
        `function | (data applied only in step calculation)<br>
-------- | ${random} <= ${chance}, hit calculated<br>
-------- | ${module.functionsSharedData.perStep.damage}dmg ${module.functionsSharedData.perStep.heating}heat`
      );

    } else {
      log(
        module.path,
        `function | (data applied only in step calculation)<br>
-------- | ${random} > ${chance}, missed`
      );
    }

    module.functionsSharedData.perStep.processed = true;
    return 0;
  },
};

export { MODULES_CALCULATION_FUNCTIONS };
