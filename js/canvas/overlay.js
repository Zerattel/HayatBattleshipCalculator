import { getMousePos } from "../../libs/canvas.js";
import { EVENTS } from "../events.js";

export default function init() {
  const canvas = document.getElementById("overlay");
  const ctx = canvas.getContext("2d");
  const style = window.getComputedStyle(canvas);

  const objectsOnOverlay = {};

  let raito = 1;

  const toCanvas = (pos) => pos * raito;

  const redrawOverlay = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i of Object.keys(objectsOnOverlay)) {
      objectsOnOverlay[i].visible && objectsOnOverlay[i].draw(canvas, ctx, toCanvas, style);
    }
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

    redrawMap();
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
