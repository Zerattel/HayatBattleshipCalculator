import { getMousePos } from "../../libs/canvas.js";
import { objects } from "../canvas/map.js";
import { check_id } from "../canvas/map/check_id.js";
import { getInArea } from "../canvas/map/get_in_area.js";
import CrosshairObject from "../canvas/objects/overlay/crosshair.js";
import { EVENTS } from "../events.js";

export default function init() {
  
  const disableModal = (modal) => {
    is_aiming = false;
    $('#modal-maneuver-aim').attr('data-active', "false")
    modal.attr("data-active", "false");

    document.dispatchEvent(
      new CustomEvent(EVENTS.OVERLAY.DELETE, {
        detail: {
          id: "modal-maneuver-crosshair",
          redraw: true,
        },
      })
    );
  }

  const enableModal = (modal) => {
    modal.attr("data-active", "true");

    document.dispatchEvent(
      new CustomEvent(EVENTS.OVERLAY.NEW, {
        detail: {
          object: new CrosshairObject(500, 500, 200),
          id: "modal-maneuver-crosshair",
          redraw: true,
        },
      })
    );

    $('#modal-maneuver-id').val(Object.keys(objects)[0]);

    onIdChange();
  }
  
  $("#tab-maneuver").click(() => {
    let modal = $("#modal-maneuver");

    if (modal.attr("data-active") == "true") {
      disableModal(modal)
    } else {
      enableModal(modal)
    }
  });


  document.addEventListener(EVENTS.CALCULATION_ENDED, (e) => {
    if ($("#modal-maneuver").attr("data-active") != "true") return;
    
    onIdChange();
  })


  let is_aiming = false;
  $('#modal-maneuver-aim').click(() => {
    is_aiming = !is_aiming;

    $('#modal-maneuver-aim').attr('data-active', is_aiming ? "true" : "false")
  })

  $('#overlay').click((e) => {
    if (!is_aiming) return;

    const { x, y } = getMousePos($('#overlay')[0], e);
    const clicked = getInArea(x, y);

    if (clicked.length == 0) return;

    $('#modal-maneuver-id').val(clicked[0].id)

    onIdChange();
  })

  $('#modal-maneuver-id').on('input', () => onIdChange());

  const onIdChange = () => {
    let id = $('#modal-maneuver-id').val();

    if (!check_id(id)) return;
    const object = objects[id];

    document.dispatchEvent(
      new CustomEvent(EVENTS.OVERLAY.FUNCTION, {
        detail: {
          id: "modal-maneuver-crosshair",
          func: "moveTo",
          attr: [ object._x, object._y ],
          redraw: true,
        },
      })
    );
  }



  $("#modal-maneuver-complete").click(() => {
    let modal = $("#modal-maneuver");
    let id = $("#modal-maneuver-id").val();

    if (!id && check_id(id)) return;

    functions[currentType](modal, id);
  });


  const functions = {
    'maneuver': (modal, id) => {
      let vel = +$("#modal-maneuver-types-maneuver-vel").val();
      let dir = +$("#modal-maneuver-types-maneuver-dir").val();

      disableModal(modal);

      document.dispatchEvent(new CustomEvent(EVENTS.MAP.FUNCTION, { detail: {
        id: id,
        func: (obj) => {
          obj.direction = dir || obj.direction;
          vel && obj.applyForce(vel);
        },
        redraw: true
      } }));
    }
  }



  let currentType = 'maneuver';
  $('#modal-maneuver-type').on('change', (e) => {
    $('#modal-maneuver-types > *').attr('data-active', 'false');

    currentType = e.target.value;
    $(`#modal-maneuver-types-${currentType}`).attr('data-active', 'true');
  })
}
