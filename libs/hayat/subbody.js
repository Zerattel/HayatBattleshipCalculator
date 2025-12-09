// libs/hayat/subbody.js (пример)
class Subbody {
  constructor(opts){
    Object.assign(this, { id: genId(), type:opts.type, parentId:opts.parentId,
      pos:opts.pos.slice(), vel:opts.vel.slice(), hp:opts.hp||10,
      maxAccel:opts.maxAccel||0, accelBudget:opts.accelBudget||0,
      hitRadius:opts.hitRadius||1, inHangar:!!opts.inHangar, state:opts.state||'idle',
      aiMode:'Stop', desiredDistance:opts.desiredDistance||100, effectiveRange:opts.effectiveRange||1000
    });
  }
  updateAI(dt, world){
    if(this.type==='projectile') return; // простая баллистика, управляется только accelBudget
    const target = world.getBody(this.parentTargetId||this.parentId);
    switch(this.aiMode){
      case 'Stop': this.applyAccel(vecScale(this.vel,-1)); break;
      case 'Distance': {
        const desiredPoint = vecAdd(target.pos, vecScale(vecNormalize(vecSub(this.pos,target.pos)), this.desiredDistance));
        const to = vecSub(desiredPoint, this.pos);
        const desiredVel = vecScale(vecNormalize(to), Math.min(this.maxSpeed||300, vecLength(to)/Math.max(1,dt)));
        this.applyAccel(vecClamp(vecSub(desiredVel,this.vel), this.maxAccel));
      } break;
      case 'Virage': {
        const r = vecSub(this.pos, target.pos); const radius = vecLength(r);
        const dir = vecNormalize(r); const tangent = [-dir[1], dir[0]];
        const orbitSpeed = Math.min(this.maxSpeed||200, Math.sqrt(this.maxAccel*radius));
        const desiredVel = vecScale(tangent, orbitSpeed);
        this.applyAccel(vecClamp(vecSub(desiredVel,this.vel), this.maxAccel));
      } break;
      case 'Intercept': {
        const dist = vecLength(vecSub(target.pos,this.pos));
        const leadTime = dist / Math.max(1, this.maxSpeed||200);
        const lead = vecAdd(target.pos, vecScale(target.vel, leadTime));
        const to = vecSub(lead, this.pos);
        const desiredVel = vecScale(vecNormalize(to), Math.min(this.maxSpeed||300, vecLength(to)/Math.max(1,dt)));
        this.applyAccel(vecClamp(vecSub(desiredVel,this.vel), this.maxAccel));
      } break;
    }
  }
  applyAccel(acc){ // acc vector already clamped
    if(this.accelBudget !== Infinity) {
      const used = vecLength(acc); 
      if(this.accelBudget <= 0) { acc = [0,0]; } else if(used>this.accelBudget){ acc = vecScale(acc, this.accelBudget/used); this.accelBudget=0; }
      else this.accelBudget -= used;
    }
    this.vel = vecAdd(this.vel, vecScale(acc, 1)); // dt folded into step logic
  }
}
