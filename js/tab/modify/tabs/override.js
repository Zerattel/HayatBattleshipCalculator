import { objects } from "../../../canvas/map.js";
import { check_id } from "../../../canvas/map/check_id.js";
import { EVENTS } from "../../../events.js";

export default class {
  currentOverridableValues = [];
  targets = [];
  
  constructor() {
    $('#modal-maneuver-types-override-target').on('change', (e) => {
      this.currentOverridableValues = this.targets.find(v => v.id == e.target.value).getValues();

      this.changeOverrideValues();
    })
  }

  onSelectionEnded(nextSelection) {
    $('#modal-maneuver-types-override-container').html("");
    $('#modal-maneuver-types-override-target').html("");
  }

  onSelectionStarted(prevSelection) {
    let id = $("#modal-maneuver-id").val();
    if (!id && check_id(id)) return;

    this.onIdChange(id);
  }

  onIdChange(id) {
    this.currentOverridableValues = objects[id].getOverridableValues();
    this.targets = [
      {
        id: 'this',
        getValues: () => objects[id].getOverridableValues(),
      },
      ...objects[id].getChildrenWithOverridableValues(),
    ]

    console.log(this.targets)

    $('#modal-maneuver-types-override-target').html("");
    let select = $('#modal-maneuver-types-override-target')[0];
    for (let data of this.targets) {
      const option = document.createElement('option');
      option.value = data.id;
      option.innerText = data.id;

      select.appendChild(option);
    }

    this.changeOverrideValues();
  }

  onComplete(modal, id) {
    for (let data of this.currentOverridableValues) {
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

    this.changeOverrideValues();
  }

  
  changeOverrideValues() {
    const body = $('#modal-maneuver-types-override-container')[0];
    body.innerHTML = "";

    for (let data of this.currentOverridableValues) {
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
}