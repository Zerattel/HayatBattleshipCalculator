import { fromCanvas } from "../js/canvas/grid.js";

export function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: fromCanvas(((evt.clientX - rect.left) / (rect.right - rect.left)) * canvas.width),
    y: fromCanvas(((evt.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height),
  };
}

export function toRealDirection(dir) {
  return -((dir - 180) % 360);
}

window.toRealDirection = toRealDirection;