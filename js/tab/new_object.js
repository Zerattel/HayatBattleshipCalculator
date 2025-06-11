import { getMousePos, toRealDirection } from "../../libs/canvas.js";
import uuidv4 from "../../libs/uuid.js";
import BasicDataHud from "../canvas/objects/map/basicDataHud.js";
import BasicMovingObject from "../canvas/objects/map/basicMovingObject.js";
import CrosshairObject from "../canvas/objects/overlay/crosshair.js";
import { EVENTS } from "../events.js";

export default function init() {
  $("#tab-new_object").click(() => {
    let modal = $("#modal-new_object");

    if (modal.attr("data-active") == "true") {
      modal.attr("data-active", "false");

      is_aiming = false;
      $('#modal-new_object-aim').attr('data-active', "false")
      document.dispatchEvent(
        new CustomEvent(EVENTS.OVERLAY.DELETE, {
          detail: {
            id: "modal-new_object-crosshair",
            redraw: true,
          },
        })
      );
    } else {
      modal.attr("data-active", "true");

      document.dispatchEvent(
        new CustomEvent(EVENTS.OVERLAY.NEW, {
          detail: {
            object: new CrosshairObject(500, 500),
            id: "modal-new_object-crosshair",
            redraw: false,
          },
        })
      );

      onPosChange()
    }
  });

  const onPosChange = () => {
    let x = +$("#modal-new_object-x").val() || 500;
    let y = +$("#modal-new_object-y").val() || 500;

    document.dispatchEvent(
      new CustomEvent(EVENTS.OVERLAY.FUNCTION, {
        detail: {
          id: "modal-new_object-crosshair",
          func: "moveTo",
          attr: [ x, y ],
          redraw: true,
        },
      })
    );
  };

  $("#modal-new_object-x").on('input', onPosChange);
  $("#modal-new_object-y").on('input', onPosChange);

  let is_aiming = false;
  $('#modal-new_object-aim').click(() => {
    is_aiming = !is_aiming;

    $('#modal-new_object-aim').attr('data-active', is_aiming ? "true" : "false")
  })

  $('#overlay').click(() => {
    is_aiming = false;

    $('#modal-new_object-aim').attr('data-active', "false")
  })

  $('#overlay').mousemove((e) => {
    if (!is_aiming) return;

    const { x, y } = getMousePos($('#overlay')[0], e);

    $("#modal-new_object-x").val(x);
    $("#modal-new_object-y").val(y);
    onPosChange();
  })


  $('#modal-new_object-complete').click(() => {
    let x = +$("#modal-new_object-x").val() || 500;
    let y = +$("#modal-new_object-y").val() || 500;
    let vel = +$("#modal-new_object-vel").val() || 0;
    let dir = +$("#modal-new_object-dir").val() || 0;
    let id = $('#modal-new_object-id').val() || uuidv4();

    let obj = new BasicMovingObject(x, y, dir, vel);
    obj.setChildren("hud", new BasicDataHud([
      { func: (hud) => `${hud.parent.id}` },
      { func: (hud) => `pos: ${Math.round(hud.parent._x)}m, ${Math.round(hud.parent._y)}m` },
      { func: (hud) => `vel: ${Math.round(hud.parent.velocity.x)}m/s, ${Math.round(hud.parent.velocity.y)}m/s` },
      { func: (hud) => `speed: ${Math.round(hud.parent.velocity.length)}m/s` },
      { func: (hud) => `dir: ${Math.round(hud.parent.direction)}deg` },
      { func: (hud) => `vdir: ${toRealDirection(Math.round(Math.atan2(hud.parent.velocity.x, hud.parent.velocity.y) / Math.PI * 180) || 0)}deg` }
    ]))

    document.dispatchEvent(
      new CustomEvent(EVENTS.MAP.NEW, {
        detail: {
          object: obj,
          id: id,
          redraw: true,
        },
      })
    );

    $("#modal-new_object").attr("data-active", "false");
    is_aiming = false;
    $('#modal-new_object-aim').attr('data-active', "false")
    document.dispatchEvent(
      new CustomEvent(EVENTS.OVERLAY.DELETE, {
        detail: {
          id: "modal-new_object-crosshair",
          redraw: true,
        },
      })
    );
  })
}
