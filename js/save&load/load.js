import { EVENTS } from "../events.js";
import classes from "./objectCollector.js";

function Wrapper(constructorFunc) {
  var _constructorFunc = constructorFunc;

  this.constructorFunc = function () {
    return _constructorFunc;
  };
}

export function load(id, data, parent = null) {
  const wrap = new Wrapper(classes[data.class]);
  const cfunc = wrap.constructorFunc();
  const object = new cfunc();

  object.load(data, true);

  if (parent == "module") return object;

  if (data.parent == "inherted" && parent) {
    parent.setChildren(id, object);
  } else {
    document.dispatchEvent(
      new CustomEvent(EVENTS.MAP.NEW, {
        detail: {
          id: id,
          object: object,
          redraw: false,
        },
      })
    );
  }
}

export function loadFunction(data) {
  return new Function(data.args, data.body);
}

export function loadJSON(json) {
  document.dispatchEvent(
    new CustomEvent(EVENTS.MAP_SET_CHANGED, {
      detail: {
        size: json.map.size,
        grid: json.map.grid,
      },
    })
  );

  for (let [i, v] of Object.entries(json.objects)) {
    load(i, v);
  }

  document.dispatchEvent(new Event(EVENTS.MAP.REDRAW));
}
