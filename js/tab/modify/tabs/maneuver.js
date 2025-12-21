import { objects } from "../../../canvas/map.js";
import { check_id } from "../../../canvas/map/check_id.js";
import { EVENTS } from "../../../events.js";

export default class {
  constructor() {}

  onSelectionEnded(nextSelection) {}

  onSelectionStarted(prevSelection) {
    let id = $("#modal-maneuver-id").val();
    if (!id && check_id(id)) return;

    this.onIdChange(id);
  }

  onIdChange(id) {
    const isComp = this.isCompatableForManeuver(id);

    $("#modal-maneuver-types-maneuver-vel").prop('disabled', !isComp);
    $("#modal-maneuver-types-maneuver-dir").prop('disabled', !isComp);
    $("#modal-maneuver-complete").prop('disabled', !isComp);

    if (!isComp) return;

    const velPlaceholder = objects[id].currentCharacteristics ? objects[id].currentCharacteristics.constant.acceleration : objects[id].velocity.length;
    $("#modal-maneuver-types-maneuver-vel").attr('placeholder', `${velPlaceholder}`)
    $("#modal-maneuver-types-maneuver-dir").attr('placeholder', `${objects[id].direction}`)

    this.updateCurrentForces(id);
  }

  updateCurrentForces(id) {
    const container = $("#modal-maneuver-types-maneuver-applied")[0];
    container.innerHTML = '';

    for (let i in objects[id].forces) {
      const c = document.createElement('div');

      const a = document.createElement('a');
      a.text = 'x';
      a.style.cursor = "pointer";
      a.onclick = () => {
        objects[id].forces = objects[id].forces.filter((v, ind) => ind != i);

        this.updateCurrentForces(id);
      }

      const v = objects[id].forces[i];
      const f = document.createElement('span');
      f.textContent = ` | x: ${Math.round(v.x)}, y: ${Math.round(v.y)}`;

      c.appendChild(a);
      c.appendChild(f);

      container.appendChild(c);
    }
  }

  onComplete(modal, id) {
    let vel = $("#modal-maneuver-types-maneuver-vel").val();
    let dir = $("#modal-maneuver-types-maneuver-dir").val();
    let type = $("#modal-maneuver-types-maneuver-type").val();
    
    if (!vel && vel !== 0) vel = +$("#modal-maneuver-types-maneuver-vel").attr('placeholder');
    if (!dir && dir !== 0) dir = +$("#modal-maneuver-types-maneuver-dir").attr('placeholder');

    document.dispatchEvent(
      new CustomEvent(EVENTS.MAP.FUNCTION, {
        detail: {
          id: id,
          func: (obj) => {
            obj.direction = +dir;
            type == "instant" ? obj.applyForce(+vel) : obj.applyContiniousForce(+vel);
          },
          redraw: true,
        },
      })
    );

    const velPlaceholder = objects[id].currentCharacteristics ? objects[id].currentCharacteristics.constant.acceleration : objects[id].velocity.length;
    $("#modal-maneuver-types-maneuver-vel").attr('placeholder', `${velPlaceholder}`)
    $("#modal-maneuver-types-maneuver-dir").attr('placeholder', `${objects[id].direction}`)

    this.updateCurrentForces(id);
  }


  isCompatableForManeuver(id) {
    return objects[id] && ('direction' in objects[id] && 'applyForce' in objects[id]);
  }
}