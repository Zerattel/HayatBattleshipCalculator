import { EVENTS } from "../events.js"

export default function init() {
  $('#main_controls-step').click(() => {
    $('#main_controls-step').prop('disabled', true);
    document.dispatchEvent(new Event(EVENTS.MAP.STEP))
  })

  document.addEventListener(EVENTS.CALCULATION_ENDED, () => {
    $('#main_controls-step').prop('disabled', false);
  })
}