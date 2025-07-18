import { updateLoading } from "../js/loading.js";
import { clamp } from "../libs/clamp.js";
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

const MODULES_CALCULATION_FUNCTIONS = {
  RENContactor: (module, parent, target) => {
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
};

export { MODULES_CALCULATION_FUNCTIONS };
