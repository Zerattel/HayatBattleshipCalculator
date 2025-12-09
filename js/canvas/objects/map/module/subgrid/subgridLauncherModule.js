import { battleships } from "../../../../../../battleships/battleships.js";
import { uuidv4 } from "../../../../../../libs/uuid.js";
import { point } from "../../../../../../libs/vector/point.js";
import { EVENTS } from "../../../../../events.js";
import { createObject } from "../../../../../save&load/load.js";
import { registerClass } from "../../../../../save&load/objectCollector.js";
import BasicDataHud from "../../hud/basicDataHud.js";
import VectorHud from "../../hud/vectorHud.js";
import { ContactController } from "../../ship/hud/contactController.js";
import ShipStatsHUD from "../../ship/hud/shipStatsHud.js";
import SignatureShower from "../../ship/hud/signatureShower.js";
import { registerSteps } from "../../step/stepInfoCollector.js";
import BaseModule from "../baseModule.js";

export default class SubgridLauncherModule extends BaseModule {
  next() {
    super.next();

    if (this.state == "active" && this.parent) {
      const id = "subgrid-" + uuidv4();
      const subgridData = battleships[this.characteristics.launcher.subgrid.dataRef];

      const object = createObject(
        this.characteristics.launcher.subgrid.class,
        this.parent._x, this.parent._y, 
        this.parent.direction, this.parent.velocity, 
        this, subgridData
      )

      const offset = (object.size ?? 30) + (this.parent.size ?? 30);

      const dirRad = ((this.parent._direction + this.characteristics.launcher.headingOffset) / 180) * Math.PI;
      const globalOffset = point(
        offset * Math.cos(dirRad),
        offset * Math.sin(dirRad)
      );

      object._x += globalOffset.x;
      object._y += globalOffset.y;

      object.applyForce(point(this.characteristics.launcher.vector[0], this.characteristics.launcher.vector[1]));

      object.setChildren(MAP_OBJECTS_IDS.CONTACT_CONTROLLER, new ContactController())
      object.setChildren(MAP_OBJECTS_IDS.SHIP_STATS_HUD,     new ShipStatsHUD())
      object.setChildren(MAP_OBJECTS_IDS.VECTOR_HUD,         new VectorHud())
      object.setChildren(MAP_OBJECTS_IDS.SIGNATURE_HUD,      new SignatureShower())
      object.setChildren(MAP_OBJECTS_IDS.DATA_HUD,           new BasicDataHud([
        { func: (hud) => `${hud.parent.id}` },
        { func: (hud) => `pos: ${Math.round(hud.parent._x)}m, ${Math.round(hud.parent._y)}m` },
        { func: (hud) => `vel: ${Math.round(hud.parent.velocity.x)}m/s, ${Math.round(hud.parent.velocity.y)}m/s` },
        { func: (hud) => `speed: ${Math.round(hud.parent.velocity.length)}m/s` },
        { func: (hud) => `dir: ${Math.round(hud.parent.direction)}deg` },
        { func: (hud) => `vdir: ${toRealDirection(Math.round(Math.atan2(hud.parent.velocity.x, hud.parent.velocity.y) / Math.PI * 180) || 0)}deg` }
      ]))

      document.dispatchEvent(
        new CustomEvent(EVENTS.MAP.NEW, {
          detail: {
            object: object,
            id: id,
            redraw: false,
          },
        })
      );
    }
  }
}

registerClass(SubgridLauncherModule);
registerSteps(SubgridLauncherModule, 0, []);