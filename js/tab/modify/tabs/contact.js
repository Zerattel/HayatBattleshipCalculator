import { getMousePos } from "../../../../libs/canvas.js";
import { point } from "../../../../libs/vector/point.js";
import { mapProps } from "../../../canvas/grid.js";
import { objects } from "../../../canvas/map.js";
import { check_id } from "../../../canvas/map/check_id.js";
import { getInArea } from "../../../canvas/map/get_in_area.js";
import MAP_OBJECTS_IDS from "../../../canvas/objects/map/mapObjectsIds.constant.js";
import LongTask from "../../../canvas/objects/map/tasks/longTask.js";
import TASKS from "../../../canvas/objects/map/tasks/tasks.constant.js";
import TargetPoint from "../../../canvas/objects/overlay/target.js";
import { EVENTS } from "../../../events.js";

export default class {
  constructor() {
    this.id = $("#modal-maneuver-types-contact-id");
    this.aimButton = $("#modal-maneuver-types-contact-aim");
    this.contains = $("#modal-maneuver-types-contact-contains");

    this.currentTargetContainer = $('#modal-maneuver-types-contact-data');
    this.currentTargetLabel = $('#modal-maneuver-types-contact-data-target');
    this.currentTargetProgress = $('#modal-maneuver-types-contact-data-progress');
    this.stopCapturingButton = $('#modal-maneuver-types-contact-data-stop');


    this.isAiming = false;
    this.aimButton.attr("data-active", "false");

    this.id.on("input", (e) => {
      const tid = e.target.value;
      if (!tid || !check_id(tid)) return;

      let id = $("#modal-maneuver-id").val();
      if (!id || !check_id(id)) return;

      if (tid == id) {
        this.id.val(
          Object.keys(objects)[0] != id ? Object.keys(objects)[0] : Object.keys(objects)[1]
        );
      }

      this.onBothIdsRight(id, tid);
    });

    $("#overlay").click((e) => {
      if (!this.isAiming) return;

      const { x, y } = getMousePos($("#overlay")[0], e);
      const clicked = getInArea(x * mapProps.size, y * mapProps.size);

      if (clicked.length == 0) return;

      this.id.val(clicked[0].id);
      this.id.trigger("input");
    });

    this.aimButton.on("click", () => {
      if (this.aimButton.attr("data-active") == "false") {
        this.aimButton.attr("data-active", "true");
        this.isAiming = true;
      } else {
        this.aimButton.attr("data-active", "false");
        this.isAiming = false;
      }
    });

    document.addEventListener(EVENTS.CALCULATION_ENDED, () => {
      let id = $("#modal-maneuver-id").val();
      if (!id || !check_id(id)) return;

      this.onIdChange(id);
    })
  }

  onSelectionEnded(nextSelection) {
    this.isAiming = false;
    this.aimButton.attr("data-active", "false");
    this.currentTargetContainer.attr("data-active", "false")

    document.dispatchEvent(
      new CustomEvent(EVENTS.OVERLAY.DELETE, {
        detail: {
          id: "modal-maneuver-target",
          redraw: true,
        },
      })
    );
  }

  onSelectionStarted(prevSelection) {
    let id = $("#modal-maneuver-id").val();
    if (!id || !check_id(id)) {
      const cur = Object.keys(objects)[0];
      $("#modal-maneuver-types-contact-id").val(cur);

      document.dispatchEvent(
        new CustomEvent(EVENTS.OVERLAY.NEW, {
          detail: {
            object: new TargetPoint(objects[cur]._x, objects[cur]._y),
            id: "modal-maneuver-target",
            redraw: true,
          },
        })
      );

      return;
    }

    this.updateCurrentTarget(id);

    document.dispatchEvent(
      new CustomEvent(EVENTS.OVERLAY.NEW, {
        detail: {
          object: new TargetPoint(),
          id: "modal-maneuver-target",
          redraw: false,
        },
      })
    );

    if (this.id.val() && check_id(this.id.val())) {
      this.onBothIdsRight(id, this.id.val());
    }
  }

  onIdChange(id) {
    this.updateCurrentTarget(id);

    if (this.id.val() && check_id(this.id.val())) {
      this.onBothIdsRight(id, this.id.val());
    }
  }

  updateCurrentTarget(id) {
    const task = objects[id].getTask(TASKS.CONTACT);

    let progress = 1;
    let target;

    if (task) {
      progress = task.lifetime / task.maxSteps;
      target = objects[task.data.id];

      if (!target) {
        this.currentTargetContainer.attr('data-active', 'false')
        
        return;
      }

      this.currentTargetProgress.attr('data-active', 'true');
      this.currentTargetProgress.css('--progress', (progress*100)+"%");
      this.currentTargetProgress.css('--progress-content', `"${task.lifetime} / ${task.maxSteps}"`);

      this.stopCapturingButton.off('click').on('click', () => {
        document.dispatchEvent(new CustomEvent(
          EVENTS.MAP.FUNCTION,
          {
            detail: {
              id: id,
              func: "deleteTask",
              attr: [ TASKS.CONTACT ],
              redraw: true,
            }
          }
        ))

        this.updateCurrentTarget(id);
      })
    } else {
      target = objects[id].callChildren(MAP_OBJECTS_IDS.CONTACT_CONTROLLER, (ctr) => ctr.target)

      if (!target) {
        this.currentTargetContainer.attr('data-active', 'false')
        
        return;
      }

      this.currentTargetProgress.attr('data-active', 'false');
      this.stopCapturingButton.off('click').on('click', () => {
        document.dispatchEvent(new CustomEvent(
          EVENTS.MAP.FUNCTION,
          {
            detail: {
              id: id,
              func: (obj) => {
                obj.callChildren(MAP_OBJECTS_IDS.CONTACT_CONTROLLER, (ctr) => { ctr.capturedTarget = null })
              },
              redraw: true,
            }
          }
        ))

        this.updateCurrentTarget(id);
      })
    }

    this.currentTargetLabel.text(target.name);
    this.currentTargetContainer.attr('data-active', 'true');
  }

  onBothIdsRight(id, tid) {
    document.dispatchEvent(
      new CustomEvent(EVENTS.OVERLAY.FUNCTION, {
        detail: {
          id: "modal-maneuver-target",
          func: "moveTo",
          attr: [objects[tid]._x, objects[tid]._y],
          redraw: true,
        },
      })
    );

    const capRange = objects[id].currentCharacteristics.constant.capture_range;
    const range = Math.round(
      point(() => point(objects[tid]._x, objects[tid]._y) - point(objects[id]._x, objects[id]._y))
        .length
    );

    if (range > capRange) {
      this.contains.html(`<p>Cannot be captured (range ${range}m > capRange ${capRange}m)</p>`);
    } else {
      if (
        objects[id].currentCharacteristics.constant.body.signature >
        objects[tid].currentCharacteristics.constant.body.signature
      ) {
        this.contains.html(
          `<p>Will be captured in ${Math.round(
            Math.sqrt(
              objects[id].currentCharacteristics.constant.body.signature /
                objects[tid].currentCharacteristics.constant.body.signature
            )
          )} steps (range ${range}m, capRange ${capRange}m)</p>`
        );
      } else {
        this.contains.html(`<p>Instant capture (range ${range}m, capRange ${capRange}m)</p>`);
      }
    }
  }

  onComplete(modal, id) {
    if (this.id.val() && check_id(this.id.val())) {
      const capRange = objects[id].currentCharacteristics.constant.capture_range;
      const range = Math.round(
        point(() => point(objects[this.id.val()]._x, objects[this.id.val()]._y) - point(objects[id]._x, objects[id]._y))
          .length
      );

      if (range > capRange) return;

      document.dispatchEvent(
        new CustomEvent(EVENTS.MAP.FUNCTION, {
          detail: {
            id: id,
            func: "newTask",
            attr: [
              new LongTask(
                (target, origin) => {
                  target.callChildren(MAP_OBJECTS_IDS.CONTACT_CONTROLLER, (cntrl) => {
                    cntrl.capturedTarget = origin.data.id;
                  });
                },
                { id: this.id.val() },
                Math.round(
                  Math.sqrt(
                    objects[id].currentCharacteristics.constant.body.signature /
                      objects[this.id.val()].currentCharacteristics.constant.body.signature
                  )
                ),
                TASKS.CONTACT
              ),
              true,
            ],
            redraw: true,
          },
        })
      );

      this.updateCurrentTarget(id);
    }
  }
}
