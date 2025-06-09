import { toRealDirection } from "../../libs/canvas.js";
import { EVENTS } from "../events.js";
import { vector, calc } from "/libs/vector/vector.js";

export default function init() {
  const canvas = document.getElementById("map");
  const ctx = canvas.getContext("2d");
  const style = window.getComputedStyle(canvas);

  const CLICK_AREA = 200;

  const objects = {};
  let lastClicked = [];

  let raito = 1;

  const toCanvas = (pos) => pos * raito;

  const redrawMap = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i of Object.keys(objects)) {
      objects[i].visible && objects[i].draw(canvas, ctx, toCanvas, style);
    }
  };

  document.addEventListener(EVENTS.ON_MAP_CLICK, (e) => {
    const { x, y } = e.detail;

    const clicked = [];

    for (let i of Object.keys(objects)) {
      if (objects[i].visible) {
        const length = vector(() =>
          toCanvas(vector(objects[i]._x, objects[i]._y) - vector(x, y))
        ).length;

        if (length <= CLICK_AREA) {
          clicked.push(objects[i]);
        }
      }
    }

    // rspeed, радиальная скорость, трансфециальная скорость, угловая скорость, дистанция

    if (objects.length <= 1) return;

    document.dispatchEvent(
      new CustomEvent(EVENTS.MAP.SHOW_RELATIVE_DATA, {
        detail: calculateRelativeData(clicked),
      })
    );

    lastClicked = clicked;
  });


  const calculateRelativeData = (clicked) => {
    const data = {};
    for (let obj1 of clicked) {
      const a = {};

      for (let obj2 of Object.values(objects)) {
        if (obj1.id == obj2.id) continue;

        const dx = obj2._x - obj1._x;
        const dy = obj2._y - obj1._y;

        const relVel = {
          x: obj2.velocity.x - obj1.velocity.x,
          y: obj2.velocity.y - obj1.velocity.y,
        };
        const relSpeed = Math.sqrt(relVel.x ** 2 + relVel.y ** 2);

        const r_mag = Math.sqrt(dx * dx + dy * dy);
        const cross = dx * relVel.y - dy * relVel.x;
        const angularVelocity = cross / (r_mag * r_mag);

        const distance = r_mag;
        const adir = (
          Math.round((Math.atan2(obj1._x - obj2._x, obj1._y - obj2._y) / Math.PI) * 180) ||
            0
        );
        const rdir = adir + obj1.direction;

        a[obj2.id] = { relSpeed, angularVelocity, distance, adir, rdir };
      }

      data[obj1.id] = a;
    }

    return data
  } 


  document.addEventListener(EVENTS.MAP_SET_CHANGED, (e) => {
    const { size, grid } = e.detail;

    raito = canvas.width / size;

    redrawMap();
  });

  document.addEventListener(EVENTS.MAP.NEW, (e) => {
    const { object, id, redraw } = e.detail;

    object.id = id;
    objects[id] = object;
    console.log(objects);
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

    lastClicked.length != 0 && document.dispatchEvent(
      new CustomEvent(EVENTS.MAP.SHOW_RELATIVE_DATA, {
        detail: calculateRelativeData(lastClicked),
      })
    );

    document.dispatchEvent(new Event(EVENTS.CALCULATION_ENDED))
  });
}
