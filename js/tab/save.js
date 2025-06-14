import uuidv4 from "../../libs/uuid.js";
import { loadJSON } from "../save&load/load.js";
import { getJSONedData } from "../save&load/save.js"

export default function init() {
  $('#tab-save').on('click', () => {
    let modal = $("#modal-map_load");

    modal.attr("data-active", modal.attr("data-active") == "true" ? "false" : "true");
  })

  let curJSONdata = {"map": {"size": 10000, "grid": 500}, "objects": {}}
  $('#modal-map_load-types-load-file').on('change', (e) => {
    const file = e.target.files[0];
    console.log(file)

    const infoBlock = $('#modal-map_load-file_info');
    const loading = $('#modal-map_load-file_load')

    if (!file) {
      infoBlock.attr('data-active', 'false')
      infoBlock.html("")

      return
    }

    var fr = new FileReader();
    fr.onload = (e) => {
      curJSONdata = JSON.parse(fr.result)

      const data = [
        [`File name: `, `${file.name}`],
        [`Last modified: `, `${file.lastModifiedDate.toLocaleString()}`],
        [`File size: `, `${Math.round(file.size / 1024 * 1000) / 1000}KB`],
        [``, ``],
        [`Map size: `, `${curJSONdata.map.size}m`],
        [`Map grid: `, `${curJSONdata.map.grid}m`],
        [`Core objects: `, `${Object.keys(curJSONdata.objects).length}`]
      ]

      infoBlock.html(data.map(([m, v]) => `<strong>${m}</strong><p>${v}</p>`).join('\n'))
      infoBlock.attr('data-active', 'true')

      loading.attr('data-active', 'false')
    }
    loading.attr('data-active', 'true')
    fr.readAsText(file)
  })

  $('#modal-map_load-complete').on('click', () => {
    $('#modal-map_load-complete').prop("disabled", true);

    switch (currentType) {
      case 'load':
        loadJSON(curJSONdata);
        break;
      default:
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getJSONedData(), undefined, 2));
        var dlAnchorElem = document.getElementById('modal-map_load-types-load-anchor');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `${uuidv4()}_${Date.now()}.json`);
        dlAnchorElem.click();
        break;
    }

    $('#modal-map_load-complete').prop("disabled", false);
  })


  let currentType = 'load';
  $('#modal-map_load-type').on('change', (e) => {
    $('#modal-map_load-types > *').attr('data-active', 'false');

    currentType = e.target.value;
    $(`#modal-map_load-types-${currentType}`).attr('data-active', 'true');
  })
}