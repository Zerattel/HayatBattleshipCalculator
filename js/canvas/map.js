import { log } from "../controls/step-logs/log.js";
import { EVENTS } from "../events.js";
import { stepLoading, updateLoading } from "../loading.js";
import { DEFAULT_SAVE_FILE, loadJSON } from "../save&load/load.js";
import { settings } from "../settings/settings.js";
import { mapProps } from "./grid.js";
import check_id from "./map/check_id.js";

import get_in_area from "./map/get_in_area.js";
import { MAX_INTER_STEPS } from "./objects/map/step/stepInfoCollector.js";

let canvas;
let ctx;
let style;
let objects;
let toCanvas;

export default function init() {
  canvas = document.getElementById("map");
  ctx = canvas.getContext("2d");
  style = window.getComputedStyle(canvas);

  objects = {};

  canvas.width = settings.mapResolution;
  canvas.height = settings.mapResolution;

  let raito = canvas.width / mapProps.size;

  toCanvas = (pos) => pos * raito;

  const redrawMap = () => {
    requestAnimationFrame(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i of Object.keys(objects)) {
        objects[i].visible && objects[i].draw(canvas, ctx, toCanvas, style);
      }
    })
  };

  get_in_area();
  check_id(objects);


  document.addEventListener(EVENTS.MAP_SET_CHANGED, (e) => {
    const { size, grid } = e.detail;

    canvas.width = settings.mapResolution;
    canvas.height = settings.mapResolution;
    raito = canvas.width / size;

    redrawMap();
  });

  document.addEventListener(EVENTS.MAP.NEW, (e) => {
    const { object, id, redraw } = e.detail;

    object.id = id;
    objects[id] = object;
    if (redraw) redrawMap();
  });

  document.addEventListener(EVENTS.MAP.DELETE, (e) => {
    const { id, redraw } = e.detail;

    delete objects[id];
    if (redraw) redrawMap();
  });

  document.addEventListener(EVENTS.MAP.FUNCTION, (e) => {
    const { id, func, attr, redraw } = e.detail;

    if (typeof func === "function") {
      func(objects[id]);
    } else {
      objects[id][func](...attr);
    }
    if (redraw) redrawMap();
  });

  document.addEventListener(EVENTS.MAP.REDRAW, (e) => {
    redrawMap();
  });

  document.addEventListener(EVENTS.MAP.STEP, (e) => {
    console.log(objects);

    updateLoading(
      'step', 
      Object.keys(objects).length * (MAX_INTER_STEPS() + 2) + 4,
      0,
      0
    );

    let data = {};
    for (let i of Object.keys(objects)) {
      data[i] = { 
        object: objects[i],
        data: objects[i].next()
      };
      stepLoading('step', 1);
    }

    stepLoading('step', 1);

    let prevData = {...data};
    for (let step=0; step < MAX_INTER_STEPS(); step++) {
      log('system', `starting ${step} inter step`)

      for (let i of Object.keys(objects)) {
        data[i] = { 
          object: objects[i],
          data: objects[i].step(step, prevData)
        };
        stepLoading('step', 1);
      }

      prevData = {...data};
    }

    stepLoading('step', 1);

    for (let i of Object.keys(objects)) {
      objects[i].finalize(prevData);

      stepLoading('step', 1);
    }

    document.dispatchEvent(new Event(EVENTS.CALCULATION_ENDED))

    stepLoading('step', 1);

    log('sys', 'map redraw...')
    redrawMap();

    stepLoading('step', 1);
  });


  document.addEventListener(EVENTS.RESET, () => {
    objects = {};
    redrawMap();
  })


  if (settings.saveLastState && settings.lastState != "{}") {
    try {
      loadJSON(JSON.parse(settings.lastState));
    } catch (e) {
      console.log(e);
      if (confirm("Error on loading last state, remove it?")) {
        if (confirm("Save last state in file?")) {
          var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(settings.lastState);
          var dlAnchorElem = document.getElementById('modal-map_load-types-load-anchor');
          dlAnchorElem.setAttribute("href", dataStr);
          dlAnchorElem.setAttribute("download", `${uuidv4()}_${Date.now()}.json`);
          dlAnchorElem.click();
        }

        settings.lastState = JSON.stringify(DEFAULT_SAVE_FILE);
      }

      objects = {};
    }
  }
}

export { ctx, canvas, style, objects, toCanvas }