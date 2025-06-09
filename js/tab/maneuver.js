import { EVENTS } from "../events.js";

export default function init() {
  $("#tab-maneuver").click(() => {
    let modal = $("#modal-maneuver");

    modal.attr("data-active", modal.attr("data-active") == "true" ? "false" : "true");
  });

  $("#modal-maneuver-complete").click(() => {
    let modal = $("#modal-maneuver");

    modal.attr("data-active", "false");

    let vel = +$("#modal-maneuver-vel").val();
    let dir = +$("#modal-maneuver-dir").val();
    let id = $("#modal-maneuver-id").val();

    if (!id) return;

    document.dispatchEvent(new CustomEvent(EVENTS.MAP.FUNCTION, { detail: {
      id: id,
      func: (obj) => {
        obj.direction = dir || obj.direction;
        vel && obj.applyForce(vel);
      },
      redraw: true
    } }));
  });
}
