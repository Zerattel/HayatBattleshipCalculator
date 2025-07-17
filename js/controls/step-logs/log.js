import { EVENTS } from "../../events.js";

export function log(path, ...objects) {
  document.dispatchEvent(new CustomEvent(EVENTS.STEP_LOG, {
    detail: {
      author: path,
      message: objects.reduce((acc, v) => {
        if (typeof v == 'object') {
          return acc + JSON.stringify(v, null, 2);
        }

        return acc + v;
      }, "")
    }
  }));
}