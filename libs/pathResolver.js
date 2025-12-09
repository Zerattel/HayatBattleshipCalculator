/**
 * 
 * @param {any} objects 
 * @param {string} path 
 * 
 * @example
 * objectFromPath(objects, "id > id > module uuid name")
 */
export function objectFromPath(objects, path) {
  let points = path.split(">").map(v => v.trim());
  let current = objects[points.shift()];

  for (let i of points) {
    if (i.startsWith("module")) {
      if ("allModules" in current) {
        const module = current.allModules.find(v => v.name == i);

        if (!module) {
          return null;
        }

        current = module;
        continue;
      } else {
        return null;
      }
    }


    current = current.children[i];
    if (!current) return null;
  }

  return current;
}