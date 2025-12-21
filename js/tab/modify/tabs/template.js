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
    let obj = objects[id];
    const saved = {
      ...obj.save(),
      __version: ENV.CURRENT_VERSION,
    };

    const asDrone = $('#modal-maneuver-types-template-as_drone').is(':checked');

    let out;
    if (asDrone) {
      saved.class = "DroneObject";
      saved.children = {};
      saved.velocity = [0, 0];
      let { x, y, step, livetime, dices, ...rest } = saved;
      out = rest;
    } else {
      out = saved;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(out, undefined, 2));
    const dlAnchorElem = document.getElementById('modal-maneuver-types-template-load_anchor');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${obj.id}_${Date.now()}.json`);
    dlAnchorElem.click();
  }
}