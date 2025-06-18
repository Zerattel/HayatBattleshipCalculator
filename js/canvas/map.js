import { EVENTS } from "../events.js";
import check_id from "./map/check_id.js";

import get_in_area from "./map/get_in_area.js";

let canvas;
let ctx;
let style;
let objects;

export default function init() {
  canvas = document.getElementById("map");
  ctx = canvas.getContext("2d");
  style = window.getComputedStyle(canvas);

  objects = {};

  let raito = 1;

  const toCanvas = (pos) => pos * raito;

  const redrawMap = () => {
    requestAnimationFrame(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i of Object.keys(objects)) {
        objects[i].visible && objects[i].draw(canvas, ctx, toCanvas, style);
      }
    })
  };

  get_in_area(objects, toCanvas);
  check_id(objects);


  document.addEventListener(EVENTS.MAP_SET_CHANGED, (e) => {
    const { size, grid } = e.detail;

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
    for (let i of Object.keys(objects)) {
      objects[i].next();
    }

    redrawMap();

    document.dispatchEvent(new Event(EVENTS.CALCULATION_ENDED))
  });
}

export { ctx, canvas, style, objects }