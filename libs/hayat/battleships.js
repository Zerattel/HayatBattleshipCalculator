const tonnage = [
  "Шаттл",
  "Корвет",
  "Фрегат",
  "Эсминец",
  "Крейсер",
  "Линейный крейсер",
  "Линкор",
  "Дредноут",
  "Корабль автономного развёртывания",
  "Титан",
];

const tonnageToCaptureRange = [
  5000, 10000, 25000, 35000, 50000, 60000, 100000, 300000, 500000, 500000,
];

const tonnageToManeuverabilityBonus = [5, 4, 3, 2, 1, 0, -2, -4, -6, -10];

const tonnageToAcceleration = [900, 600, 420, 300, 180, 120, 90, 60, 30, 18];

export { tonnage, tonnageToCaptureRange, tonnageToManeuverabilityBonus, tonnageToAcceleration };



const baseBattleshipCharacteristics = {
  dynamic: {
    hp: {
      /** текущая значение корпуса */
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
        range: 0,
      },
    },
  },
};

export { baseBattleshipCharacteristics };