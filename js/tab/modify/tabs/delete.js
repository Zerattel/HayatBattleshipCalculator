import { objects } from "../../../canvas/map.js";
import { check_id } from "../../../canvas/map/check_id.js";
import { EVENTS } from "../../../events.js";

export default class {
  constructor() {}

  onSelectionEnded(nextSelection) {

  }

  onSelectionStarted(prevSelection) {

  }

  onIdChange(id) {

  }

  onComplete(modal, id) {
    document.dispatchEvent(
      new CustomEvent(EVENTS.MAP.FUNCTION, {
        detail: {
          id: id,
          func: (obj) => obj.destroy(),
          redraw: true,
        },
      })
    );

    $("#modal-maneuver-id").val(Object.keys(objects)[0]);
    $("#modal-maneuver-id").trigger("input");
  }
}