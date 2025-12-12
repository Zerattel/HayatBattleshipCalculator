import { EVENTS } from "../events.js";
import { DEFAULT_SAVE_FILE, loadJSON } from "../save&load/load.js";

export default function init() {
  $("#tab-map_set").click(() => {
    let modal = $("#modal-map_set");

    const setTo = modal.attr("data-active") == "true" ? "false" : "true";
    modal.attr("data-active", setTo);
    $('#tab-map_set').attr("data-active", setTo);
  });

  $("#modal-map_set-complete").click(() => {
    let modal = $("#modal-map_set");

    modal.attr("data-active", "false");
    $('#tab-map_set').attr("data-active", "false");

    let size = +$("#modal-map_set-size").val() || 10000;
    let grid = +$("#modal-map_set-grid").val() || 500;

    let offsetX = +$("#modal-map_set-offx").val() || 0;
    let offsetY = +$("#modal-map_set-offy").val() || 0;

    document.dispatchEvent(new CustomEvent(EVENTS.MAP_SET_CHANGED, { detail: { size, grid, offset: { x: offsetX, y: offsetY } } }));
  });


  $("#modal-map_set-reset").on('click', () => {
    if (confirm("Are you sure?")) {
      loadJSON(DEFAULT_SAVE_FILE);
    }
  })
}
