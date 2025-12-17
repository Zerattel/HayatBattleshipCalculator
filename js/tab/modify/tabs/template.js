import { objects } from "../../../canvas/map.js";
import ENV from "../../../enviroments/env.js";

export default class {
  constructor() {}

  onSelectionEnded(nextSelection) {

  }

  onSelectionStarted(prevSelection) {

  }

  onIdChange(id) {

  }

  onComplete(modal, id) {
    if (!objects[id]) return;
    const obj = objects[id];

    const saved = {
      ...obj.save(),
      __version: ENV.CURRENT_VERSION,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(saved, undefined, 2));
    const dlAnchorElem = document.getElementById('modal-maneuver-types-template-load_anchor');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${obj.id}_${Date.now()}.json`);
    dlAnchorElem.click();
  }
}