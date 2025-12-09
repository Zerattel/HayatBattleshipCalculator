import { ObjectConnection } from "../../../../../../../libs/connection.js";
import { calc, point } from "../../../../../../../libs/vector/point.js";
import { EVENTS } from "../../../../../../events.js";
import { registerClass } from "../../../../../../save&load/objectCollector.js";
import { objects } from "../../../../../map.js";
import MAP_OBJECTS_IDS from "../../../mapObjectsIds.constant.js";
import { registerSteps } from "../../../step/stepInfoCollector.js";
import SubgridObject from "../subgridObject.js";

export default class SelfguidedSubgridObject extends SubgridObject {
  target = new ObjectConnection(() => objects);


  constructor(x, y, direction, velocity, controlledBy = null, battleshipChars = {}) {
    super(x, y, direction, velocity, controlledBy, battleshipChars);

    this.target.Connection = controlledBy?.parent.children[MAP_OBJECTS_IDS.CONTACT_CONTROLLER].target;
  }


  save(realParent = null) {
    return {
      ...super.save(realParent),
      target: this.target.Connection?.path ?? null,
    };
  }

  load(data, loadChildren = false) {
    super.load(data, false);
    
    this.target.storeConnection(data.target ?? null);

    loadChildren && super.loadChildren(data);
  }

  afterLoad() {
    this.target.forceLoadConnection(); // загружаем как объект

    super.afterLoad();
  }

  physicsSimulationStep(step, dt, objectsData) {
    const prevForces = super.physicsSimulationStep(step, dt, objectsData) ?? [];

    const missile = this;
    const target = this.target.Connection;

    if (!target || this.currentCharacteristics?.constant?.body?.subgrid?.fuel <= this._livetime) {
        return prevForces;
    }

    const thrust = (this.currentCharacteristics?.constant?.body?.subgrid?.thrust) ?? 100;

    // Позиции
    const R = { x: this._x, y: this._y };
    const T = { x: target._x, y: target._y };

    // Скорости
    const body = {
        vx: this.velocity.x,
        vy: this.velocity.y,
        deltaVStep: thrust * dt
    };
    const tgt = {
        vx: (target.velocity && typeof target.velocity.x === "number") ? target.velocity.x : 0,
        vy: (target.velocity && typeof target.velocity.y === "number") ? target.velocity.y : 0
    };

    // Вектор до цели
    const dx = T.x - R.x;
    const dy = T.y - R.y;

    // Угол на цель
    const angleToTarget = Math.atan2(dy, dx);

    // Относительная скорость
    const relativeVx = body.vx - tgt.vx;
    const relativeVy = body.vy - tgt.vy;

    // Поперечная составляющая скорости
    const transverseVelocity =
        relativeVx * Math.sin(angleToTarget) -
        relativeVy * Math.cos(angleToTarget);

    // Поправка поперечной скорости
    const transverseCorrectionX = -transverseVelocity * Math.sin(angleToTarget);
    const transverseCorrectionY =  transverseVelocity * Math.cos(angleToTarget);

    // Итоговый манёвр
    const maneuverVx = body.deltaVStep * Math.cos(angleToTarget) + transverseCorrectionX;
    const maneuverVy = body.deltaVStep * Math.sin(angleToTarget) + transverseCorrectionY;

    const outX = maneuverVx / dt;
    const outY = maneuverVy / dt;

    // Обновляем визуальный угол (поворот по направлению силы)
    const currentAngle = Math.atan2(-outY, outX);
    this._direction = currentAngle * 180 / Math.PI + 90;

    return [...prevForces, { x: outX, y: outY }];
  }


  finalize(objectsData) {
    let data = super.finalize(objectsData);

    const selfDestruct = this.currentCharacteristics.constant.body.subgrid?.self_destruct_in ?? 120;

    if (
      this._livetime >= selfDestruct ||
      this.currentCharacteristics.dynamic.hp.hull <= 0
    ) {
      document.dispatchEvent(
        new CustomEvent(EVENTS.MAP.DELETE, {
          detail: {
            id: this.id,
          },
        })
      );
    }

    return data;
  }
}

registerClass(SelfguidedSubgridObject);
registerSteps(SelfguidedSubgridObject, 0, []);
