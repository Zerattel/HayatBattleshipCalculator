import { EVENTS } from "../events.js";

export default function init() {
  $("#tab-map_set").click(() => {
    let modal = $("#modal-map_set");

    modal.attr("data-active", modal.attr("data-active") == "true" ? "false" : "true");
  });

  $("#modal-map_set-complete").click(() => {
    let modal = $("#modal-map_set");

    modal.attr("data-active", "false");

    let size = +$("#modal-map_set-size").val() || 10000;
    let grid = +$("#modal-map_set-grid").val() || 500;

    document.dispatchEvent(new CustomEvent(EVENTS.MAP_SET_CHANGED, { detail: { size, grid } }));
  });
}
