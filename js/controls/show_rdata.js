import { EVENTS } from "../events.js";

export default function init() {
  $("#relative > div > button").click(() => {
    let modal = $("#relative");

    modal.attr("data-active", modal.attr("data-active") == "true" ? "false" : "true");
  });

  document.addEventListener(EVENTS.MAP.SHOW_RELATIVE_DATA, (e) => {
    $("#relative").attr("data-active", "true")

    let text = "";
    for (let [id, objects] of Object.entries(e.detail)) {
      text += `${id}`
      for (let [rid, { relSpeed, angularVelocity, distance, adir, rdir }] of Object.entries(objects)) {
        text += `
└ ${rid}
  ├ rspeed: ${relSpeed}m/s
  ├ angvel: ${angularVelocity}
  ├ adir: ${adir}deg
  ├ rdir: ${rdir}deg
  └ dist: ${distance}m`
      }
      text += "\n"
    }

    $("#relative > div > pre").html(text)
  })
}