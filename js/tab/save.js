import uuidv4 from "../../libs/uuid.js";
import { loadJSON } from "../save&load/load.js";
import { getJSONedData } from "../save&load/save.js"

export default function init() {
  $('#tab-save').on('click', () => {
    let modal = $("#modal-map_load");

    modal.attr("data-active", modal.attr("data-active") == "true" ? "false" : "true");
  })

  $('#modal-map_load-complete').on('click', () => {
    $('#modal-map_load-complete').prop("disabled", true);

    switch (currentType) {
      case 'load':
        const file = document.getElementById('modal-map_load-types-load-file').files[0];
        var fr = new FileReader();
        fr.onload = () => {
          loadJSON(JSON.parse(fr.result))

          $('#modal-map_load-complete').prop("disabled", false);
        }
        fr.readAsText(file)
        break;
      default:
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getJSONedData(), undefined, 2));
        var dlAnchorElem = document.getElementById('modal-map_load-types-load-anchor');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `${uuidv4()}_${Date.now()}.json`);
        dlAnchorElem.click();
        
        $('#modal-map_load-complete').prop("disabled", false);
        break;
    }
  })


  let currentType = 'load';
  $('#modal-map_load-type').on('change', (e) => {
    $('#modal-map_load-types > *').attr('data-active', 'false');

    currentType = e.target.value;
    $(`#modal-map_load-types-${currentType}`).attr('data-active', 'true');
  })
}