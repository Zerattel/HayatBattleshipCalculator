const SIMULATION_STATES = {
  NEXT: "next",
  STEP: "step",

  /** physics only */
  PHYSICS_SIMULATION: "physics simulation",
  /** physics only */
  AFTER_SIMULATION: "after simulation",

  FINALIZE: "finalize"
}


/**
 * 
 * @param {string} state 
 * @returns {[string, number | null]} [state, step | null]
 */
export function parceSimulationState(state) {
  if (
    state === SIMULATION_STATES.NEXT ||
    state === SIMULATION_STATES.AFTER_SIMULATION ||
    state === SIMULATION_STATES.FINALIZE
  ) {
    return [state, null];
  }

  if (state.startsWith(SIMULATION_STATES.PHYSICS_SIMULATION + " ")) {
    const parts = state.split(" ");
    const n = Number(parts[parts.length - 1]);
    return [SIMULATION_STATES.PHYSICS_SIMULATION, Number.isNaN(n) ? null : n];
  }

  if (state.startsWith(SIMULATION_STATES.STEP + " ")) {
    const parts = state.split(" ");
    const n = Number(parts[parts.length - 1]);
    return [SIMULATION_STATES.STEP, Number.isNaN(n) ? null : n];
  }

  return [SIMULATION_STATES.FINALIZE, null];
}

/**
 * 
 * @param {SIMULATION_STATES} state 
 * @param {number?} step 
 * @returns 
 */
export function generateSimulationState(state, step = null) {
  switch (state) {
    case SIMULATION_STATES.NEXT:
    case SIMULATION_STATES.AFTER_SIMULATION:
    case SIMULATION_STATES.FINALIZE:
      return state;
    case SIMULATION_STATES.PHYSICS_SIMULATION:
    case SIMULATION_STATES.STEP:
      return `${state} ${step}`;
    default:
      return [SIMULATION_STATES.FINALIZE, null];
  }
}


export default SIMULATION_STATES;