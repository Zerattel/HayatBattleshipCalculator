import { clamp } from "../clamp.js";

const tonnage = {
  null: "Индустриальный",
  0: "Шаттл",
  1: "Корвет",
  2: "Фрегат",
  3: "Эсминец",
  4: "Крейсер",
  5: "Линейный крейсер",
  6: "Линкор",
  7: "Дредноут",
  8: "Корабль автономного развёртывания",
  9: "Титан",
};

const tonnageToCaptureRange = [
  5000, 10000, 25000, 35000, 50000, 60000, 100000, 300000, 500000, 500000,
];

const tonnageToManeuverabilityBonus = [5, 4, 3, 2, 1, 0, -2, -4, -6, -10];

const tonnageToAcceleration = [240, 180, 150, 120, 90, 72, 54, 36, 18, 12];

const energyToKineticDamage = 0.0000017;
const energyToHeating = 0.000000001;

export { tonnage, tonnageToCaptureRange, tonnageToManeuverabilityBonus, tonnageToAcceleration, energyToKineticDamage, energyToHeating };


const baseBattleshipCharacteristics = {
  dynamic: {
    /** характеристика для получения урона (корректный перенос урона между значениями) */
    recived_damage: {
      kinetic: 0,
      high_explosive: 0,
      electro_magnetic: 0,
      thermal: 0,
    },
    hp: {
      /** текущее значение корпуса */
      hull: 100,
      /** текущее значение брони */
      armor: 100,
      /** текущее значение барьера */
      barrier: 100,
    },
    /** текущее значение нагрева */
    temperature: 0,
    /** заряд конденсатора */
    charge: 0,
  },
  constant: {
    body: {
      /** тоннаж */
      tonnage: 0,
      /** поколение ядра */
      core: 0,
      /** масса */
      mass: 0,
      containers: {
        /** трюм */
        storage: 0,
        /** ангар */
        hangar: 0,
      },
      /** радиус сигнатуры */
      signature: 0,
    },
    /** максимальное ускорение */
    acceleration: 0,
    /** дальность прыжка (СДЕЛАЙ ЭТО ПЛЕЙСХОЛДЕРОМ JUMP CALCULATION!!!!) */
    jumpdistance: 0,
    /** маневренность */
    maneuverability: 0,
    /** сила сенсоров */
    sensors_power: 0,
    /** дальность захвата */
    capture_range: 5000,
    capacitor: {
      /** максимальный заряд */
      charge: 0,
      /** перезарядка за ход */
      generation: 0,
    },
    slots: {
      /** внешные слоты ОМ */
      external: 0,
      /** инженерные слоты ОМ */
      internal: 0,
    },
    hp: {
      /** максимальное значение корпуса */
      hull: 100,
      /** максимальное значение брони */
      armor: 100,
      /** максимальное значение барьера */
      barrier: 100,
    },
    collision_energy_distribution: {
      damage: 0.69,
      velocity: 0.3,
      heat: 0.01,
    },
    /** максимальное значение нагрева */
    temperature: 1,
    /** нагрев за ход */
    heating: 0,
    resistance: {
      /** кинетическая сопротивляемость */
      kinetic: {
        hull: 0,
        armor: 0,
        barrier: 0,
      },
      /** фугасная сопротивляемость */
      high_explosive: {
        hull: 0,
        armor: 0,
        barrier: 0,
      },
      /** ЭМ сопротивляемость */
      electro_magnetic: {
        hull: 0,
        armor: 0,
        barrier: 0,
      },
      /** тепловая сопротивляемость */
      thermal: {
        hull: 0,
        armor: 0,
        barrier: 0,
      },
      /** Сопротивляемость к РЭБ */
      EW: 0,
    },
    barrier: {
      /** стабильная пассивная регенерация */
      passive_regeneration: 0.01,
      resonance: {
        /** резонансная частота */
        frequency: 0.3,
        /** тенденция к резонансу */
        tendency: 0.01,
        /** резонансный диапазон */
        range: 0.4,
      },
    },

    modulemodifier: {
      /** Модификаторы для вооружения */
      offence: {
        /** Модификаторы для баллистики */
        ballistic: {
          effective_distance_modifier: 1,
          damage_modifier: 1,
          tracking_modifier: 1,
          capacitor_consumption_modifier: 1,
          heating_modifier: 1,
          target_heating_modifier: 1
        },
        /** Модификаторы для лазеров */
        laser: {
          effective_distance_modifier: 1,
          damage_modifier: 1,
          tracking_modifier: 1,
          capacitor_consumption_modifier: 1,
          heating_modifier: 1,
          target_heating_modifier: 1
        },
        /** Модификаторы для ПУ */
        launcher: {
          on_hit_damage_modifier: 1,
          fuel_modifier: 1,
          acceleration_modifier: 1,
          explosion_signature_modifier: 1,
          capacitor_consumption_modifier: 1,
          heating_modifier: 1,
          on_hitheating_modifier: 1
        },
        /** Модификаторы для АОЕ атак */
        bomb: {
          effective_distance_modifier: 1,
          damage_modifier: 1,
          capacitor_consumption_modifier: 1,
          heating_modifier: 1,
        },
        /** Модификаторы для дезинтеграторов */
        desintegrator: {
          effective_distance_modifier: 1,
          damage_modifier: 1,
          tracking_modifier: 1,
          capacitor_consumption_modifier: 1,
          heating_modifier: 1,
          target_heating_modifier: 1,
          /** Бонус урону от каждой атаки */
          per_shot_bonus_modifier: 1,
          /** Потолок бонуса */
          max_stack_modifier: 1,
        },
        /** Модификаторы силы НАШИХ средств Радиоэлектронной Борьбы */
        EW: {
          effective_distance_modifier: 1,
          capacitor_consumption_modifier: 1,
          heating_modifier: 1,
          target_heating_modifier: 1,
          /** Основной бонус, накладывающийся на все последующие сверху */
          EW_strenght_modifier: 1,
          /** Чисто для профильных особенностей и каких-то мега узкоспециализированных штуковин */
          tracking_disruption_modifier: 1,
          stasis_modifier: 1,
          maneuverability_disruption_modifier: 1,
          contact_quality_disruption_modifier: 1,
          signature_painting_modifier: 1,
          capacitor_disruption_modifier: 1
        },
        /** Модификаторы субтел этого тела */
        vehicle: {
          vehicle_damage_modifier: 1,
          vehicle_acceleration_modifier: 1,
          vehicle_target_heating_modifier: 1,
          vehicle_effective_distance_modifier: 1,
          vehicle_signature_modifier: 1,
          vehicle_maneuverability_modifier: 1,
          vehicle_hp_modifier: 1
        }
      },
      /** Модификаторы работы инженерных модулей */
      engineering: {
        /** Бонус ремонта */
        /** Барьера */
        barrier: {
          passive_recharge_modifier: 1,
          active_recharge_modifier: 1,
          active_recharge_consumption: 1,
          active_recharge_heating: 1,
          resonance: {
          /** резонансная частота */
          frequency: 0.3,
          /** тенденция к резонансу */
          tendency: 0.01,
          /** резонансный диапазон */
          range: 0.4,
        }
      },
        /** Брони */
        armor: {
          active_repair_modifier: 1,
          active_repair_consumption: 1,
          active_repair_heating: 1
        },
        hardener: {
          active: {
            barrier: {
              effectiveness_modifier: 1,
              capacitor_consumption_modifier: 1,
              heating_modifier: 1
            },
            armor: {
              effectiveness_modifier: 1,
              capacitor_consumption_modifier: 1,
              heating_modifier: 1
            }
          },
          passive: {
            barrier: {
              effectiveness_modifier: 1
            },
            armor: {
              effectiveness_modifier: 1
            }
          }
        },
        mobility: {
          micro_distortion_drive: {
            effectiveness_modifier: 1,
            capacitor_consumption_modifier: 1,
            heating_modifier: 1,
            signature_penalty_modifier: 1
          },
          afterburner: {
            effectiveness_modifier: 1,
            capacitor_consumption_modifier: 1,
            heating_modifier: 1
          }
        },
        thermodynamic: {
          radiation_modifier: 1,
          consumption_modifier: 1,
          signature_penalty_modifier: 1
        }

      },
      /** Модификаторы работы модулей поддержки флота и дистанционного снабжения. */
      /** Отсюда же берут баффы и аппараты снабжения и поддержки. */
      support: {
        effective_distance_modifier: 1,
        capacitor_consumption_modifier: 1,
        heating_modifier: 1,
        /** Основной бонус, накладывающийся на все последующие сверху */
        support_strenght_modifier: 1,
        /** Чисто для профильных особенностей и каких-то мега узкоспециализированных штуковин */
        tracking_support_modifier: 1,
        acceleration_support_modifier: 1,
        maneuverability_support_modifier: 1,
        contact_quality_support_modifier: 1,
        signature_suppression_modifier: 1,
        capacitor_injection_modifier: 1,
        shield_injection_modifier: 1,
        armor_repair_modifier: 1,
      },
      precursor: {
        desintegrator: {
          bonus_cap_modifier: 1,
          per_step_bonus_modifier: 1
        },
        membrane: {
          bonus_cap_modifier: 1,
          per_step_bonus_modifier: 1
        },
      }
    }
  },
};

const battleshipCharacteristicsClampRules = {
  dynamic: {
    hp: {
      hull: (c, v) => clamp(v, 0, c.constant.hp.hull),
      armor: (c, v) => clamp(v, 0, c.constant.hp.armor),
      barrier: (c, v) => clamp(v, 0, c.constant.hp.barrier),
    },
    temperature: (c, v) => v < 0 ? 0 : v,
    charge: (c, v) => clamp(v, 0, c.constant.capacitor.charge),
  },
  constant: {
    body: {
      signature: (c, v) => v < 0 ? 0 : v,
    },
    capacitor: {
      charge: (c, v) => v < 0 ? 0 : v,
    },
    resistance: {
      kinetic: {
        hull: [0, 1],
        armor: [0, 1],
        barrier: [0, 1],
      },
      high_explosive: {
        hull: [0, 1],
        armor: [0, 1],
        barrier: [0, 1],
      },
      electro_magnetic: {
        hull: [0, 1],
        armor: [0, 1],
        barrier: [0, 1],
      },
      thermal: {
        hull: [0, 1],
        armor: [0, 1],
        barrier: [0, 1],
      },
    }
  },
};

export { baseBattleshipCharacteristics, battleshipCharacteristicsClampRules };


/**
 * 
 * @param {number} maxHull maximum hull capacity value
 * @param {number} curTemp current temperature
 * @param {number} maxTemp maximum temperature
 * @returns {number} temprature damage
 */
const overheatDamage = (maxHull, curTemp, maxTemp) => maxHull * ( curTemp - maxTemp ) / 100;

/**
 * 
 * @param {{ 
 *  passive_regeneration: number; 
 *  resonance: { 
 *    frequency: number; 
 *    tendency: number; 
 *    range: number; 
 * }}} barrierStats 
 * @param {number} curBarrier current barrier value
 * @param {number} maxBarrier maximum barrier value
 * @returns {number} barrier regeneration
 */
const passiveBarrierRegeneration = (barrierStats, curBarrier, maxBarrier) => {
  const curPer = curBarrier / maxBarrier;

  const regenInPer = 
    (barrierStats.resonance.tendency - barrierStats.passive_regeneration) 
      *
    (1 - barrierStats.resonance.range) 
      ** 
        (
          -((curPer - barrierStats.resonance.range) ** 2)
            /
          (barrierStats.resonance.range + barrierStats.resonance.range * curPer)
        ) 
      +
    barrierStats.passive_regeneration
  
  return regenInPer * maxBarrier;
}

/**
 * Calculate resulted maneuverability
 * @param {object} characteristics ship's characteristics
 * @param {object} maneuverDice number on maneuver d20
 * @returns {number}
 */
const getFullManeuverability = (characteristics, maneuverDice) => {
  return characteristics.constant.maneuverability + maneuverDice
}

// === SUBBODY SYSTEM =====================================================
class Subbody {
  constructor(opts = {}) {
    Object.assign(this, {
      id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
      type: opts.type || "projectile",   // projectile | apparatus
      parentId: opts.parentId || null,
      targetId: opts.targetId || null,
      pos: opts.pos || [0, 0],
      vel: opts.vel || [0, 0],
      hp: opts.hp || 10,
      maxAccel: opts.maxAccel || 0,
      accelBudget: opts.accelBudget ?? Infinity,
      hitRadius: opts.hitRadius || 2,
      maxSpeed: opts.maxSpeed || 200,
      aiMode: opts.aiMode || "Stop",
      desiredDistance: opts.desiredDistance || 500,
      inHangar: opts.inHangar ?? false,
      state: opts.state || "idle", // idle, active, online, offline, overheat
      effectiveRange: opts.effectiveRange || 1000,
      barrier: opts.barrier || 0,
      barrierMax: opts.barrierMax || 0,
      barrierRegen: opts.barrierRegen || 0,
    });
  }

  /** основной апдейт субтела */
  step(dt, world) {
    if (this.hp <= 0 || this.inHangar) return;
    const target = world.getBody?.(this.targetId);

    if (this.type === "projectile") {
      if (this.accelBudget > 0) {
        const accelMag = Math.min(this.maxAccel, this.accelBudget);
        const accel = this._dirTo(target) ? vecScale(this._dirTo(target), accelMag) : [0, 0];
        this.vel = vecAdd(this.vel, vecScale(accel, dt));
        this.accelBudget -= accelMag * dt;
      }
    } else if (this.type === "apparatus") {
      this._updateAI(dt, target);
    }

    // Движение
    this.pos = vecAdd(this.pos, vecScale(this.vel, dt));
  }

  /** простейший AI */
  _updateAI(dt, target) {
    if (!target) return;
    const toTarget = vecSub(target.pos, this.pos);
    const dist = vecLength(toTarget);
    const dir = vecNormalize(toTarget);

    switch (this.aiMode) {
      case "Stop":
        this.vel = vecScale(this.vel, 0.9); // трение
        break;

      case "Distance":
        if (Math.abs(dist - this.desiredDistance) > 10) {
          const desiredVel = vecScale(dir, (dist - this.desiredDistance) * 0.1);
          this._steer(desiredVel, dt);
        }
        break;

      case "Virage":
        const tangent = [-dir[1], dir[0]];
        const orbitVel = Math.min(this.maxSpeed, Math.sqrt(this.maxAccel * this.desiredDistance));
        this._steer(vecScale(tangent, orbitVel), dt);
        break;

      case "Intercept":
        const tLead = dist / Math.max(1, this.maxSpeed);
        const leadPos = vecAdd(target.pos, vecScale(target.vel, tLead));
        const leadDir = vecNormalize(vecSub(leadPos, this.pos));
        this._steer(vecScale(leadDir, this.maxSpeed), dt);
        break;
    }
  }

  _steer(desiredVel, dt) {
    const diff = vecSub(desiredVel, this.vel);
    const accel = vecClamp(diff, this.maxAccel);
    this.vel = vecAdd(this.vel, vecScale(accel, dt));
  }

  _dirTo(target) {
    if (!target) return null;
    return vecNormalize(vecSub(target.pos, this.pos));
  }
}

// === Простые векторные функции ===
function vecAdd(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
function vecSub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
function vecScale(v, s) { return [v[0] * s, v[1] * s]; }
function vecLength(v) { return Math.sqrt(v[0]**2 + v[1]**2); }
function vecNormalize(v) { const l = vecLength(v)||1; return [v[0]/l, v[1]/l]; }
function vecClamp(v, max) { const l = vecLength(v); return l>max ? vecScale(v, max/l) : v; }

export { overheatDamage, passiveBarrierRegeneration, getFullManeuverability }