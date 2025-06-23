import { toCurrentCanvasSize } from "../../../../../../libs/canvas.js";
import { getExternalTangentPoints, lerp } from "../../../../../../libs/math.js";
import { point } from "../../../../../../libs/vector/point.js";
import { EVENTS } from "../../../../../events.js";
import { registerClass } from "../../../../../save&load/objectCollector.js";
import { objects } from "../../../../map.js";
import BasicStepObject from "../../basicStepObject.js";
import MAP_OBJECTS_IDS from "../../mapObjectsIds.constant.js";
import TASKS from "../../tasks/tasks.constant.js";

export class ContactController extends BasicStepObject {
  capturedTarget = null;

  constructor() {
    super();

    document.addEventListener(EVENTS.CALCULATION_ENDED, () => {
      if (!this.parent || !this.capturedTarget) return;

      const capRange = this.parent.currentCharacteristics.constant.capture_range;
      const range = Math.round(
        point(
          () =>
            point(this.capturedTarget._x, this.capturedTarget._y) -
            point(this.parent._x, this.parent._y)
        ).length
      );

      if (range > capRange) {
        this.capturedTarget = null;
      }
    });
  }

  get target() {
    if (this.capturedTarget) {
      if (typeof this.capturedTarget == "string") {
        if (objects[this.capturedTarget]) {
          this.capturedTarget = objects[this.capturedTarget];
        } else {
          this.capturedTarget = null;
        }
      }

      return this.capturedTarget;
    }

    return null;
  }

  next() {
    if (!this.parent) return;
    if (this.target) return;

    const task = this.parent.getTask(TASKS.CONTACT);
    if (!task) return;

    const target = objects[task.data.id];

    if (!target) {
      this.parent.deleteTask(TASKS.CONTACT);

      return;
    }
  }

  draw(canvas, ctx, toCanvas, style) {
    super.draw(canvas, ctx, toCanvas, style);

    if (!this.parent) return;

    let target;
    let progress = 1;

    const task = this.parent.getTask(TASKS.CONTACT);

    if (task) {
      progress = task.lifetime / task.maxSteps;
      target = objects[task.data.id];

      if (!target) return;
    } else {
      if (!this.target) return;

      target = this.target;
    }

    const lines = getExternalTangentPoints(
      this.parent._x,
      this.parent._y,
      this.parent.currentCharacteristics.constant.body.signature,
      target._x,
      target._y,
      target.currentCharacteristics.constant.body.signature
    );

    if (!lines) return;

    const biCapture =
      target.callChildren(MAP_OBJECTS_IDS.CONTACT_CONTROLLER, (cnt) => {
        return cnt.target && cnt.target.id == this.parent.id;
      }) || (target.getTask(TASKS.CONTACT) || { data: { id: null } }).data.id == this.parent.id;

    let posl1, posl2;
    if (
      this.parent.currentCharacteristics.constant.body.signature <
        target.currentCharacteristics.constant.body.signature &&
      biCapture
    ) {
      const dist = toCurrentCanvasSize(canvas, 40);

      const l1_offset = point(() =>
        toCanvas(point(lines[0].p1.x, lines[0].p1.y) - point(this.parent._x, this.parent._y))
      ).normalize();
      const l2_offset = point(() =>
        toCanvas(point(lines[1].p1.x, lines[1].p1.y) - point(this.parent._x, this.parent._y))
      ).normalize();

      ctx.strokeStyle = style.getPropertyValue("--accent");
      ctx.lineWidth = toCurrentCanvasSize(canvas, 20);
      ctx.setLineDash([toCurrentCanvasSize(canvas, 60), toCurrentCanvasSize(canvas, 60)]);

      posl1 = [
        toCanvas(lines[0].p1.x) + l1_offset.x * dist,
        toCanvas(lines[0].p1.y) + l1_offset.y * dist,
        toCanvas(lines[0].p2.x) + l1_offset.x * dist,
        toCanvas(lines[0].p2.y) + l1_offset.y * dist,
      ];
      posl2 = [
        toCanvas(lines[1].p1.x) + l2_offset.x * dist,
        toCanvas(lines[1].p1.y) + l2_offset.y * dist,
        toCanvas(lines[1].p2.x) + l2_offset.x * dist,
        toCanvas(lines[1].p2.y) + l2_offset.y * dist,
      ];
    } else {
      ctx.strokeStyle = style.getPropertyValue("--accent");
      ctx.lineWidth = toCurrentCanvasSize(canvas, 20);

      posl1 = [
        toCanvas(lines[0].p1.x),
        toCanvas(lines[0].p1.y),
        toCanvas(lines[0].p2.x),
        toCanvas(lines[0].p2.y),
      ];
      posl2 = [
        toCanvas(lines[1].p1.x),
        toCanvas(lines[1].p1.y),
        toCanvas(lines[1].p2.x),
        toCanvas(lines[1].p2.y),
      ];
    }

    ctx.beginPath();
    ctx.moveTo(posl1[0], posl1[1]);
    ctx.lineTo(lerp(posl1[0], posl1[2], progress), lerp(posl1[1], posl1[3], progress));

    ctx.moveTo(posl2[0], posl2[1]);
    ctx.lineTo(lerp(posl2[0], posl2[2], progress), lerp(posl2[1], posl2[3], progress));
    ctx.stroke();

    if (progress < 1) {
      ctx.strokeStyle = style.getPropertyValue("--target");

      ctx.beginPath();
      ctx.moveTo(lerp(posl1[0], posl1[2], progress), lerp(posl1[1], posl1[3], progress));
      ctx.lineTo(posl1[2], posl1[3]);

      ctx.moveTo(lerp(posl2[0], posl2[2], progress), lerp(posl2[1], posl2[3], progress));
      ctx.lineTo(posl2[2], posl2[3]);
      ctx.stroke();
    }

    if (!biCapture) {
      const drawArrow = (x1, y1, x2, y2) => {
        const arrowSize = toCurrentCanvasSize(canvas, 100);

        const x = lerp(x1, x2, 0.5);
        const y = lerp(y1, y2, 0.5);

        const dir = point(() => point(x2, y2) - point(x1, y1)).normalize();

        ctx.beginPath();

        ctx.moveTo(
          x - dir.x * (arrowSize / 2) - dir.y * (arrowSize / 3),
          y - dir.y * (arrowSize / 2) + dir.x * (arrowSize / 3)
        );
        ctx.lineTo(x + dir.x * (arrowSize / 2), y + dir.y * (arrowSize / 2));
        ctx.lineTo(
          x - dir.x * (arrowSize / 2) + dir.y * (arrowSize / 3),
          y - dir.y * (arrowSize / 2) - dir.x * (arrowSize / 3)
        );

        ctx.stroke();
      };

      drawArrow(...posl1);
      drawArrow(...posl2);
    }

    ctx.setLineDash([]);
  }

  save(realParent = null) {
    return {
      ...super.save(realParent),
      capturedTarget: this.target ? this.target.id : null,
    };
  }

  load(data, loadChildren = false) {
    super.load(data, false);
    this.capturedTarget = data.capturedTarget;

    loadChildren && super.loadChildren(data);
  }
}

registerClass(ContactController);
