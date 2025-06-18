import format, { addPlus } from "../../../../libs/format.js";
import { modules } from "../../../../modules/modules.js";
import { objects } from "../../../canvas/map.js";
import { check_id } from "../../../canvas/map/check_id.js";
import BaseModule from "../../../canvas/objects/map/module/baseModule.js";
import BasicTask from "../../../canvas/objects/map/tasks/basicTask.js";
import { EVENTS } from "../../../events.js";

const htmlTemplate = `<div class="module" id="{0}">
  <div class="statbar">
    <div class="state">{1}{2}</div>
    <div class="name">
      <label>{3}</label>
      <span>{4}</span>
      <span>{5}</span>
    </div>
  </div>
  <div class="modifiers-container">
    {6}
  </div>
</div>`

const states = {
  'offline': '⭕', 
  'online': '🔘', 
  'active': '🟢', 
  'overload': '💢'
}

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

    $(window).click(() => $('#modal-maneuver-types-modules-contextmenu').attr('data-active', 'false'))
    $('#modal-maneuver-types-modules-contextmenu').click((e) => e.stopPropagation())
  }

  onSelectionEnded(nextSelection) {
    $('#modal-maneuver-types-modules-contextmenu').attr('data-active', 'false')
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

  updateModuleState(uuid, state) {
    let id = $("#modal-maneuver-id").val();
    if (!id && check_id(id)) return;

    document.dispatchEvent(
      new CustomEvent(EVENTS.MAP.FUNCTION, {
        detail: {
          id: id,
          func: "newTask",
          attr: [ new BasicTask(
            (target, origin) => {
              const t = target.getModule(origin.data.uuid)
              t && t.setState(origin.data.state)
            }, { uuid: uuid, state: state }, "changeModuleState-"+uuid
          ), true ],
          redraw: false,
        }
      }
    ))
  }

  onModuleClick(e) {
    console.log(e)

    let id = $("#modal-maneuver-id").val();
    if (!id && check_id(id)) return;

    const uuid = e.currentTarget.id;

    const contextmenu = $('#modal-maneuver-types-modules-contextmenu');
    contextmenu.attr('data-active', 'true');
    contextmenu.css('top', e.clientY)
    contextmenu.css('left', e.clientX)

    const changeTask = objects[id].tasks.find(v => v.id == "changeModuleState-"+uuid && v.data.uuid == uuid)
    const module = objects[id].getModule(uuid);


    $('#modal-maneuver-types-modules-contextmenu .state > *')
      .attr('data-active', '')
      .off('click')
      .on('click', (e) => {
        if (['true', 'changeto'].includes($(e.currentTarget).attr('data-active'))) return;

        this.updateModuleState(uuid, e.currentTarget.id);
        this.updateModules(id);
      })


    if (module.characteristics.activation == "passive") {
      $('#modal-maneuver-types-modules-contextmenu .state > #active').attr('data-active', "false");
      $('#modal-maneuver-types-modules-contextmenu .state > #overload').attr('data-active', "false");
    }

    $('#modal-maneuver-types-modules-contextmenu .state > #'+module.state).attr('data-active', 'true')
    if (changeTask) {
      $('#modal-maneuver-types-modules-contextmenu .state > #'+changeTask.data.state).attr('data-active', 'changeto')
    }

    $('#modal-maneuver-types-modules-contextmenu #delete').off('click').on('click', () => {
      document.dispatchEvent(
        new CustomEvent(EVENTS.MAP.FUNCTION, {
          detail: {
            id: id,
            func: "removeModule",
            attr: [ uuid ],
            redraw: false,
          }
        })
      )

      this.updateModules(id);
    })

    return false;
  }


  updateModules(id) {
    $('#modal-maneuver-types-modules-contextmenu').attr('data-active', 'false')

    const container = $('#modal-maneuver-types-modules-container')
    container.html('')

    let text = [];
    const generate = (ofobj) => {
      for (let r of ofobj) {
        const changeTask = objects[id].tasks.find(v => v.id == "changeModuleState-"+r.uuid && v.data.uuid == r.uuid)

        text.push(format(
          htmlTemplate, 
          r.uuid, 
          states[r.state],
          changeTask ? `<label>${states[changeTask.data.state]}</label>` : '',
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

    $('#modal-maneuver-types-modules-container .module').on('contextmenu', (e) => this.onModuleClick(e))
  }

  checkIfCompatable(id) {
    return objects[id] && (
      'internalModules' in objects[id] &&
      'externalModules' in objects[id] &&
      'otherModules' in objects[id]
    )
  }
}