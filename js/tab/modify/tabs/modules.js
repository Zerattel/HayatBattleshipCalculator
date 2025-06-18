import format, { addPlus } from "../../../../libs/format.js";
import { modules } from "../../../../modules/modules.js";
import { objects } from "../../../canvas/map.js";
import { check_id } from "../../../canvas/map/check_id.js";
import BaseModule from "../../../canvas/objects/map/module/baseModule.js";
import { EVENTS } from "../../../events.js";

const htmlTemplate = `<div class="module" id="{0}">
  <div class="statbar">
    <div class="state">{1}</div>
    <div class="name">
      <label>{2}</label>
      <span>{3}</span>
      <span>{4}</span>
    </div>
  </div>
  <div class="modifiers-container">
    {5}
  </div>
</div>`

export default class {
  constructor() {
    const select = $('#modal-maneuver-types-modules-all')[0];
    for (let m in modules) {
      const option = document.createElement('option');
      option.value = m;
      option.innerText = m;

      select.appendChild(option);
    }

    $('#modal-maneuver-types-modules-add').on('click', (e) => this.onModuleAdd(e))
  }

  onSelectionEnded(nextSelection) {

  }

  onSelectionStarted(prevSelection) {
    let id = $("#modal-maneuver-id").val();
    if (!id && check_id(id)) return;

    this.onIdChange(id);
  }

  onIdChange(id) {
    if (!this.checkIfCompatable(id)) {
      return;
    }

    this.updateModules(id);
  }

  onComplete(modal, id) {

  }

  onModuleAdd() {
    let id = $("#modal-maneuver-id").val();
    if (!id && check_id(id)) return;

    const module = $('#modal-maneuver-types-modules-all').val();
    const position = $('#modal-maneuver-types-modules-pos').val();

    document.dispatchEvent(
      new CustomEvent(
        EVENTS.MAP.FUNCTION,
        {
          detail: {
            id: id,
            func: "addModule",
            attr: [ new BaseModule(modules[module]), position ],
            redraw: false,
          }
        }
      )
    )

    this.updateModules(id);
  }


  updateModules(id) {
    const container = $('#modal-maneuver-types-modules-container')
    container.html('')

    let text = [];
    const generate = (ofobj) => {
      for (let r of ofobj) {
        text.push(format(
          htmlTemplate, 
          r.uuid, 
          {
            'offline': '⭕', 
            'online': '🔘', 
            'active': '🟢', 
            'overload': '💢'
          }[r.state],
          r.characteristics.main.name,
          r.fullType,
          r.uuid,
          r.characteristics.modificators[r.state].map(
            v => `<span>${
                v.characteristic.startsWith('constant.') ? 'const' : 'dnmc'
              }</span><div>${
                v.characteristic.replace('constant.', '')
              }</div><label>${
                v.modificationType == "percent" 
                  ? addPlus(Math.round((1 - v.modificator)*100))+"%" 
                  : addPlus(v.modificator)
              }</label>`
          ).join('\n')
        ))
      }
    }
    
    if (objects[id].internalModules.length != 0) {
      text.push(`<p>Internal Modules</p>`);
      generate(objects[id].internalModules);
    }
    
    if (objects[id].externalModules.length != 0) {
      text.push(`<p>External Modules</p>`);
      generate(objects[id].externalModules);
    }

    if (objects[id].otherModules.length != 0) {
      text.push(`<p>Other Modules</p>`);
      generate(objects[id].otherModules);
    }

    container.html(text.join('\n'))
  }

  checkIfCompatable(id) {
    return objects[id] && (
      'internalModules' in objects[id] &&
      'externalModules' in objects[id] &&
      'otherModules' in objects[id]
    )
  }
}