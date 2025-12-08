import format from "../../../libs/format.js";
import { LinkedList } from "../../../libs/linkedList.js";
import { EVENTS } from "../../events.js";
import { settings } from "../../settings/settings.js";

const TEMPLATE = "<p><span>{0}</span><span>{1}</span><label>{2}</label></p>";

let logs = new LinkedList();

// [time, author, message]
let currentStepLogs = [];

export default function () {
  const container = $("#step-logs_chat-container")[0];

  document.addEventListener(EVENTS.STEP_LOG, (e) => {
    const { author, message } = e.detail;

    const time = new Date();
    const timeStr = `${time.getHours()}:${time.getMinutes()}.${time.getSeconds()} ${time.getMilliseconds()}`;
    container.innerHTML =
      container.innerHTML +
      format(
        TEMPLATE,
        timeStr,
        author,
        message
      );
    
    currentStepLogs.push([timeStr, author, message]);
  });

  $("#step-logs_hide").on("click", () => {
    $("#main_controls-step_logs").attr(
      "data-active",
      $("#main_controls-step_logs").attr("data-active") == "false" ? "true" : "false"
    );
  });

  document.addEventListener(EVENTS.MAP.STEP, () => {
    container.innerHTML = "";
    logs.appendNode(currentStepLogs);
    currentStepLogs = [];
  });
}


function dumpLogs() {
  if (!settings.saveLogs) return [];

  const out = [];

  let a = logs.removeHead();
  while (a != null) {
    out.push(a);

    a = logs.removeHead();
  }

  return out;
}

function loadLogs(l) {
  for (let log of l) {
    logs.appendNode(log);
  }
}

export { logs, dumpLogs, loadLogs };
