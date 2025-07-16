const stepsToObjects = {}; 

export function registerSteps(cls, steps, info=[]) {
  stepsToObjects[cls.name] = {
    cls: cls,
    steps: steps,
    info: info,
  };
}

export function MAX_INTER_STEPS() {
  return Math.max(...Object.values(stepsToObjects).map(v => v.steps))
}

export default stepsToObjects;