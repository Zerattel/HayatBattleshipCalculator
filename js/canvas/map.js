import { mergeDeep } from "../../libs/deepMerge.js";
import { compareVersions } from "../../libs/utils.js";
import { log } from "../controls/step-logs/log.js";
import ENV from "../enviroments/env.js";
import { EVENTS } from "../events.js";
import { stepLoading, updateLoading } from "../loading.js";
import PhysicsEngine from "../physics/engine.js";
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
        Object.keys(objects).length 
          * (MAX_INTER_STEPS() + 2) // steps + next + finalize для каждого объекта
        + 4 // промежуточные состояния
        + 4 + ENV.PHYSICS_ENGINE_STEPS + Object.keys(objects).length, // физ движок
      0,
      0
    );

    let data = {};
    for (let i of Object.keys(objects)) {
      data[i] = objects[i].next();
      stepLoading('step', 1);
    }

    stepLoading('step', 1);

    let prevData = {...data};
    for (let step=0; step < MAX_INTER_STEPS(); step++) {
      log('system', `starting ${step} inter step`)
      console.log(prevData)

      for (let i of Object.keys(objects)) {
        data[i] = objects[i].step(step, prevData);
        stepLoading('step', 1);
      }

      prevData = mergeDeep(prevData, data);
    }

    stepLoading('step', 1);
    log('system', `init physics engine`);

    const physics = new PhysicsEngine();
    physics.setStep(ENV.STEP, ENV.PHYSICS_ENGINE_STEPS);

    stepLoading('step', 1);
    log('system', `gather object infos`);


    for (let id of Object.keys(objects)) {
      const obj = objects[id];

      const intent = {
        id: id,
        pos: { x: obj._x, y: obj._y },
        vel: { x: obj.velocity?.x || 0, y: obj.velocity?.y || 0 },
        mass:       typeof obj.mass === "function" ? obj.mass : (obj.mass ?? 1),
        radius:     typeof obj.size === "function" ? obj.size : (obj.size ?? 10),
        bounciness: typeof obj.bounciness === "function" ? obj.bounciness : (obj.bounciness ?? 0.2),
        type: obj.constructor?.name || "object",
        forces: [...(prevData[id]?.appliedForces ?? [])] // силы которые будут применятся (если будут)
      };
      physics.registerIntent(intent);
    }


    stepLoading('step', 1);
    log('system', `physics simulation...`);
    const exportPhysicsState = () => {
      const physRes = physics.exportStates();

      for (let id of Object.keys(objects)) {
        prevData[id] = {
          ...prevData[id],
          _physics: physRes.states[id] ? {
            pos: physRes.states[id].pos,
            vel: physRes.states[id].vel,
            radius: physRes.states[id].radius
          } : prevData[id]?._physics
        };
      }

      prevData._physics_collisions = physRes.collisions;
    }

    const finalize = () => {
      log('system', `done! export states...`);
    
      exportPhysicsState();
      
      for (let i of Object.keys(objects)) {
        objects[i].afterSimulation?.(prevData);

        stepLoading('step', 1);
      }

      log('system', `done!`);
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
    }


    const dt = ENV.STEP / ENV.PHYSICS_ENGINE_STEPS;
    const onStep = (step) => {
      exportPhysicsState();

      const callback = {};
      for (let i of Object.keys(objects)) {
        const f = objects[i].physicsSimulationStep?.(step, dt, prevData);

        if (f !== undefined) callback[i] = f;
      }

      stepLoading('step', 1);

      return callback;
    }

    if (settings.instantSimulation) {
      physics.instantSimulate(onStep);

      return finalize();
    }


    const next = physics.simulate(onStep);

    const sim = (deltaTime) => {
      const time = ENV.STEP * 1000 / ENV.PHYSICS_ENGINE_STEPS * (1 / settings.physicsSimulationSpeedupMultiplier);

      setTimeout(() => {
        const start = Date.now();
        const simResult = next();
        redrawMap();

        const delta = Date.now() - start;
        log('system', `physics simulation ${simResult === false ? "last" : simResult} step, delta: ${delta}ms`);

        if (simResult !== false) { sim(delta); }
        else { finalize(); }
      }, time - deltaTime)
    }

    next();
    sim(0);
  });


  document.addEventListener(EVENTS.RESET, () => {
    objects = {};
    redrawMap();
  })


  document.addEventListener(EVENTS.LOAD_ENDED, () => {
    for (let i of Object.keys(objects)) objects[i].afterLoad?.();
  })


  if (settings.saveLastState && settings.lastState != "{}") {
    try {
      const json = JSON.parse(settings.lastState);

      const version = json.version ?? "0.0.0";
      if (compareVersions(ENV.SUPPORTED_SAVE_VERSION, version) == 1) {
        alert("Unsupported save version.");
        throw new Error("Unsupported save version");
      }

      loadJSON(json);
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