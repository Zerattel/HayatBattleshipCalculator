import { getJSONedData } from "../save&load/save.js";

let settings = {
  gridResolution: 2000,
  mapResolution: 8000,
  overlayResolution: 2000,

  hudSize: 1,

  physicsSimulationSpeedupMultiplier: 20,
  instantSimulation: false,

  saveLastState: true,
  saveLogs: false,
  lastState: "{}",
}


const fromString = {
  gridResolution: Number,
  mapResolution: Number,
  overlayResolution: Number,

  hudSize: Number,

  physicsSimulationSpeedupMultiplier: Number,
  instantSimulation: (v) => v === "true",

  saveLastState: (v) => v === "true",
  saveLogs: (v) => v === "true",  
  lastState: String,
}


function saveSettings() {
  for (let [n, v] of Object.entries(settings)) {
    localStorage.setItem(n, v);
  }
}

export default function () {
  for (let n in settings) {
    const val = localStorage.getItem(n);

    if (val !== undefined) settings[n] = fromString[n](val);
  }

  window.addEventListener("beforeunload", function(e) {
    if (settings.saveLastState) settings.lastState = JSON.stringify(getJSONedData());

    saveSettings();
  });
}

export { settings, saveSettings }