import { getMousePos } from "../../libs/canvas.js";
import { EVENTS } from "../events.js";

let canvas;
let ctx;
let style;
let objectsOnOverlay;

export default function init() {
  canvas = document.getElementById("overlay");
  ctx = canvas.getContext("2d");
  style = window.getComputedStyle(canvas);

  objectsOnOverlay = {};

  let raito = 1;

  const toCanvas = (pos) => pos * raito;

  const redrawOverlay = () => {
    requestAnimationFrame(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i of Object.keys(objectsOnOverlay)) {
        objectsOnOverlay[i].visible && objectsOnOverlay[i].draw(canvas, ctx, toCanvas, style);
      }
    })
  };

  canvas.onclick = (e) => {
    document.dispatchEvent(
      new CustomEvent(EVENTS.ON_MAP_CLICK, {
        detail: getMousePos(canvas, e),
      })
    );
  };

  document.addEventListener(EVENTS.MAP_SET_CHANGED, (e) => {
    const { size, grid } = e.detail;

    raito = canvas.width / size;

    redrawOverlay();
  });

  document.addEventListener(EVENTS.OVERLAY.NEW, (e) => {
    const { object, id, redraw } = e.detail;

    object.id = id;
    objectsOnOverlay[id] = object;
    console.log(objectsOnOverlay);
    if (redraw) redrawOverlay();
  });

  document.addEventListener(EVENTS.OVERLAY.DELETE, (e) => {
    const { id, redraw } = e.detail;

    delete objectsOnOverlay[id];
    if (redraw) redrawOverlay();
  });

  document.addEventListener(EVENTS.OVERLAY.FUNCTION, (e) => {
    const { id, func, attr, redraw } = e.detail;

    if (typeof func === "function") {
      func(objectsOnOverlay[id]);
    } else {
      objectsOnOverlay[id][func](...attr);
    }
    if (redraw) redrawOverlay();
  });
}

export { ctx, canvas, style, objectsOnOverlay }