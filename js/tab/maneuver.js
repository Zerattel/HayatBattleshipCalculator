import { getMousePos } from "../../libs/canvas.js";
import { objects } from "../canvas/map.js";
import { check_id } from "../canvas/map/check_id.js";
import { getInArea } from "../canvas/map/get_in_area.js";
import AccentPoint from "../canvas/objects/overlay/accentPoint.js";
import CrosshairObject from "../canvas/objects/overlay/crosshair.js";
import { EVENTS } from "../events.js";

export default function init() {
  const disableModal = (modal) => {
    is_aiming = false;
    $("#modal-maneuver-aim").attr("data-active", "false");
    modal.attr("data-active", "false");
    onChangeFunctions[currentType](false);

    document.dispatchEvent(
      new CustomEvent(EVENTS.OVERLAY.DELETE, {
        detail: {
          id: "modal-maneuver-crosshair",
          redraw: true,
        },
      })
    );
  };

  const enableModal = (modal) => {
    modal.attr("data-active", "true");
    onChangeFunctions[currentType](true);

    document.dispatchEvent(
      new CustomEvent(EVENTS.OVERLAY.NEW, {
        detail: {
          object: new CrosshairObject(500, 500, 200),
          id: "modal-maneuver-crosshair",
          redraw: true,
        },
      })
    );

    $("#modal-maneuver-id").val(Object.keys(objects)[0]);

    onIdChange();
  };

  $("#tab-maneuver").click(() => {
    let modal = $("#modal-maneuver");

    if (modal.attr("data-active") == "true") {
      disableModal(modal);
    } else {
      enableModal(modal);
    }
  });

  document.addEventListener(EVENTS.CALCULATION_ENDED, (e) => {
    if ($("#modal-maneuver").attr("data-active") != "true") return;

    onIdChange();
  });

  let is_aiming = false;
  $("#modal-maneuver-aim").click(() => {
    is_aiming = !is_aiming;

    $("#modal-maneuver-aim").attr("data-active", is_aiming ? "true" : "false");
  });

  $("#overlay").click((e) => {
    if (!is_aiming) return;

    const { x, y } = getMousePos($("#overlay")[0], e);
    const clicked = getInArea(x, y);

    if (clicked.length == 0) return;

    $("#modal-maneuver-id").val(clicked[0].id);

    onIdChange();
  });

  $("#modal-maneuver-id").on("input", () => onIdChange());

  const onIdChange = () => {
    let id = $("#modal-maneuver-id").val();

    if (!check_id(id)) return;
    const object = objects[id];

    onIdChangeFunctions[currentType](id);

    document.dispatchEvent(
      new CustomEvent(EVENTS.OVERLAY.FUNCTION, {
        detail: {
          id: "modal-maneuver-crosshair",
          func: "moveTo",
          attr: [object._x, object._y],
          redraw: true,
        },
      })
    );
  };



  $("#modal-maneuver-complete").click(() => {
    let modal = $("#modal-maneuver");
    let id = $("#modal-maneuver-id").val();

    if (!id && check_id(id)) return;

    onDoFunctions[currentType](modal, id);
  });



  const onDoFunctions = {
    maneuver: (modal, id) => {
      let vel = +$("#modal-maneuver-types-maneuver-vel").val();
      let dir = +$("#modal-maneuver-types-maneuver-dir").val();

      document.dispatchEvent(
        new CustomEvent(EVENTS.MAP.FUNCTION, {
          detail: {
            id: id,
            func: (obj) => {
              obj.direction = dir || obj.direction;
              vel && obj.applyForce(vel);
            },
            redraw: true,
          },
        })
      );
    },
    jump_calc: (modal, id) => {
      let dist = +$("#modal-maneuver-types-jump_cal-dist").val();

      document.dispatchEvent(
        new CustomEvent(EVENTS.MAP.FUNCTION, {
          detail: {
            id: id,
            func: "moveTo",
            attr: calculateJump(id, dist),
            redraw: true,
          },
        })
      );

      document.dispatchEvent(
        new CustomEvent(EVENTS.OVERLAY.FUNCTION, {
          detail: {
            id: "modal-maneuver-crosshair",
            func: "moveTo",
            attr: [objects[id]._x, objects[id]._y],
            redraw: false,
          },
        })
      );

      setAccentPoint(id, dist);
    },
    override: (modal, id) => {
      for (let data of currentOverridableValues) {
        const elem = $('#modal-maneuver-types-override-'+data.name+' > input')[0];
        let val = elem.value;

        if (data.type == 'checkbox') val = !!elem.checked;
        else if (!val) continue;

        data.func(val);
      }

      document.dispatchEvent(
        new CustomEvent(EVENTS.OVERLAY.FUNCTION, {
          detail: {
            id: "modal-maneuver-crosshair",
            func: "moveTo",
            attr: [objects[id]._x, objects[id]._y],
            redraw: true,
          },
        })
      );

      document.dispatchEvent(new Event(EVENTS.MAP.REDRAW));

      changeOverrideValues();
    }
  };


  const onChangeFunctions = {
    maneuver: (state) => {
      if (!state) return;

      let id = $("#modal-maneuver-id").val();
      if (!id && check_id(id)) return;

      onIdChangeFunctions.maneuver(id);
    },
    hud: (state) => {},
    jump_calc: (state) => {
      if (state) {
        document.dispatchEvent(
          new CustomEvent(EVENTS.OVERLAY.NEW, {
            detail: {
              object: new AccentPoint(500, 500),
              id: "modal-maneuver-jump_calc-accent",
              redraw: false,
            },
          })
        );

        let id = $("#modal-maneuver-id").val();
        if (!id && check_id(id)) return;

        onIdChangeFunctions.jump_calc(id);
      } else {
        document.dispatchEvent(
          new CustomEvent(EVENTS.OVERLAY.DELETE, {
            detail: {
              id: "modal-maneuver-jump_calc-accent",
              redraw: true,
            },
          })
        );
      }
    },
    override: (state) => {
      if (state) {
        console.log('a')

        let id = $("#modal-maneuver-id").val();
        if (!id && check_id(id)) return;

        onIdChangeFunctions.override(id);
      } else {
        $('#modal-maneuver-types-override').html("")
      }
    },
  };


  const onIdChangeFunctions = {
    maneuver: (id) => {
      const isComp = isCompatableForManeuver(id);

      $("#modal-maneuver-types-maneuver-vel").prop('disabled', !isComp);
      $("#modal-maneuver-types-maneuver-dir").prop('disabled', !isComp);
      $("#modal-maneuver-complete").prop('disabled', !isComp)
    },
    hud: (id) => {},
    jump_calc: (id) => {
      const isComp = isCompatableForJump(id);
      $('#modal-maneuver-types-jump_cal-dist').prop('disabled', !isComp)
      $("#modal-maneuver-complete").prop('disabled', !isComp)

      document.dispatchEvent(
        new CustomEvent(EVENTS.OVERLAY.FUNCTION, {
          detail: {
            id: "modal-maneuver-jump_calc-accent",
            func: "setVisible",
            attr: [ isComp ],
            redraw: true,
          },
        })
      );

      if (!isComp) return;

      setAccentPoint(id, +$("#modal-maneuver-types-jump_cal-dist").val() || 0);
    },
    override: (id) => {
      currentOverridableValues = objects[id].getOverridableValues();

      changeOverrideValues();
    },
  };


  const isCompatableForManeuver = (id) => {
    return objects[id] && ('direction' in objects[id] && 'applyForce' in objects[id]);
  }


  let currentOverridableValues = [];

  const changeOverrideValues = () => {
    const body = $('#modal-maneuver-types-override')[0];
    body.innerHTML = "";

    for (let data of currentOverridableValues) {
      const containerDiv = document.createElement('div');
      containerDiv.id = 'modal-maneuver-types-override-' + data.name;

      const label = document.createElement('p');
      label.textContent = data.name + ': ';

      const input = document.createElement('input');
      input.type = data.type;
      input.placeholder = data.current();
      input.classList = 'fit';

      if (data.type == 'checkbox') {
        input.checked = data.current();
      }

      containerDiv.appendChild(label);
      containerDiv.appendChild(input);

      body.appendChild(containerDiv);
    }
  }


  const isCompatableForJump = (id) => {
    return objects[id] && '_direction' in objects[id];
  }

  const calculateJump = (id, dist) => {
    const x = objects[id]._x + Math.sin((objects[id]._direction / 180) * Math.PI) * dist;
    const y = objects[id]._y + Math.cos((objects[id]._direction / 180) * Math.PI) * dist;

    return [x, y];
  };

  const setAccentPoint = (id, dist) => {
    if (!isCompatableForJump(id)) return;

    const pos = calculateJump(id, dist);

    $('#modal-maneuver-types-jump_cal-x').text(pos[0]);
    $('#modal-maneuver-types-jump_cal-y').text(pos[1]);

    document.dispatchEvent(
      new CustomEvent(EVENTS.OVERLAY.FUNCTION, {
        detail: {
          id: "modal-maneuver-jump_calc-accent",
          func: "moveTo",
          attr: [...pos, objects[id]._x, objects[id]._y],
          redraw: true,
        },
      })
    );
  };



  $("#modal-maneuver-types-jump_cal-dist").on("input", (e) => {
    let id = $("#modal-maneuver-id").val();

    if (!id && check_id(id)) return;
    if (currentType != "jump_calc") return;

    setAccentPoint(id, +e.target.value || 0);
  });

  let currentType = "maneuver";
  $("#modal-maneuver-type").on("change", (e) => {
    $("#modal-maneuver-types > *").attr("data-active", "false");
    $("#modal-maneuver-complete").prop('disabled', false)

    onChangeFunctions[currentType](false);

    currentType = e.target.value;
    $(`#modal-maneuver-types-${currentType}`).attr("data-active", "true");

    onChangeFunctions[currentType](true);
  });
}
