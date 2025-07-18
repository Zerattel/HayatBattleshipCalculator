import format from "../../../libs/format.js";
import { EVENTS } from "../../events.js";

const TEMPLATE = "<p><span>{0}</span><span>{1}</span><label>{2}</label></p>";

export default function () {
  const container = $("#step-logs_chat-container")[0];

  document.addEventListener(EVENTS.STEP_LOG, (e) => {
    const { author, message } = e.detail;

    const time = new Date();
    container.innerHTML =
      container.innerHTML +
      format(
        TEMPLATE,
        `${time.getHours()}:${time.getMinutes()}.${time.getSeconds()} ${time.getMilliseconds()}`,
        author,
        message
      );
  });

  $("#step-logs_hide").on("click", () => {
    $("#main_controls-step_logs").attr(
      "data-active",
      $("#main_controls-step_logs").attr("data-active") == "false" ? "true" : "false"
    );
  });

  document.addEventListener(EVENTS.MAP.STEP, () => {
    container.innerHTML = "";
  });
}
