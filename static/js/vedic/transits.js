import { calculateGrahas } from "./grahas.js";

const ASPECT_SYSTEM = {
  name: "Whole-sign Graha Drishti",
  version: "v1",
  nodes: "seventh-house convention"
};

const TRANSIT_ASPECTS = {
  surya: [7],
  chandra: [7],
  mangal: [4, 7, 8],
  budha: [7],
  guru: [5, 7, 9],
  shukra: [7],
  shani: [3, 7, 10],
  rahu: [7],
  ketu: [7]
};

const TRANSIT_GRAHA_KEYS = [
  "surya",
  "chandra",
  "mangal",
  "budha",
  "guru",
  "shukra",
  "shani",
  "rahu",
  "ketu"
];

function assertValidDate(dateUTC) {
  if (!(dateUTC instanceof Date) || Number.isNaN(dateUTC.getTime())) {
    throw new Error("Invalid UTC date supplied to transit calculation.");
  }
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function angularDistance(a, b) {
  const diff = Math.abs(normalizeDegrees(a) - normalizeDegrees(b));
  return Math.min(diff, 360 - diff);
}

function houseDistance(fromRashiIndex, toRashiIndex) {
  return ((toRashiIndex - fromRashiIndex + 12) % 12) + 1;
}

function getGrahaDrishti(
  transitGrahaKey,
  transitRashiIndex,
  natalRashiIndex
) {
  const aspectHouses =
    TRANSIT_ASPECTS[transitGrahaKey] || [7];

  const aspectHouse =
    houseDistance(
      transitRashiIndex,
      natalRashiIndex
    );

  const grahaDrishti =
    aspectHouses.includes(aspectHouse);

  let aspectType = "seventh";

  if (transitGrahaKey === "mangal") {
    aspectType = "mangal-special";
  } else if (transitGrahaKey === "guru") {
    aspectType = "guru-special";
  } else if (transitGrahaKey === "shani") {
    aspectType = "shani-special";
  } else if (
    transitGrahaKey === "rahu" ||
    transitGrahaKey === "ketu"
  ) {
    aspectType = "node-convention";
  }

  return {
    grahaDrishti,
    aspectHouse: grahaDrishti
      ? aspectHouse
      : null,
    aspectType,
    aspectHouses
  };
}

export function calculateTransitSky(dateUTC) {
  assertValidDate(dateUTC);

  const grahas = calculateGrahas(dateUTC);

  return {
    dateUTC: dateUTC.toISOString(),
    ayanamsha: grahas.ayanamsha,
    aspectSystem: ASPECT_SYSTEM,
    grahas
  };
}

export function compareTransitToNatal(
  transitSky,
  natalKundali
) {
  if (!transitSky || !transitSky.grahas) {
    throw new Error("Invalid transit sky supplied.");
  }

  if (!natalKundali || !natalKundali.grahas) {
    throw new Error("Invalid natal Kundali supplied.");
  }

  const natalLagnaRashi =
    natalKundali.ascendant.rashi.index;

  const natalMoon =
    natalKundali.grahas.chandra;

  const natalMoonRashi =
    natalMoon.rashi.index;

  const transitGrahas = {};

  for (const key of TRANSIT_GRAHA_KEYS) {
    const transit = transitSky.grahas[key];

    if (!transit) {
      continue;
    }

    const transitRashiIndex =
      transit.rashi.index;

    const contacts = {};

    for (const natalKey of TRANSIT_GRAHA_KEYS) {
      const natal = natalKundali.grahas[natalKey];

      if (!natal) {
        continue;
      }

      const drishti =
        getGrahaDrishti(
            key,
            transitRashiIndex,
            natal.rashi.index
        );

        contacts[natalKey] = {
        angularSeparation:
            angularDistance(
            transit.longitude,
            natal.longitude
            ),

        sameRashi:
            transit.rashi.index ===
            natal.rashi.index,

        houseFromTransit:
            houseDistance(
            transitRashiIndex,
            natal.rashi.index
            ),

        grahaDrishti:
            drishti.grahaDrishti,

        aspectHouse:
            drishti.aspectHouse,

        aspectType:
            drishti.aspectType,

        aspectHouses:
            drishti.aspectHouses
        };
    }

    transitGrahas[key] = {
      key,
      name: transit.name,
      longitude: transit.longitude,
      rashi: transit.rashi,
      nakshatra: transit.nakshatra,
      retrograde: transit.retrograde,

      houseFromNatalLagna:
        houseDistance(
          natalLagnaRashi,
          transitRashiIndex
        ),

      houseFromNatalMoon:
        houseDistance(
          natalMoonRashi,
          transitRashiIndex
        ),

      contacts
    };
  }

  return {
    dateUTC: transitSky.dateUTC,
    ayanamsha: transitSky.ayanamsha,
    aspectSystem:
        transitSky.aspectSystem || ASPECT_SYSTEM,
    grahas: transitGrahas
  };
}

export function calculateTransitSnapshot(
  dateUTC,
  natalKundali = null
) {
  const sky = calculateTransitSky(dateUTC);

  if (!natalKundali) {
    return {
      sky
    };
  }

  return {
    sky,
    natalComparison:
      compareTransitToNatal(
        sky,
        natalKundali
      )
  };
}

export function calculateTransitSeries(
  startUTC,
  endUTC,
  stepHours = 24,
  natalKundali = null
) {
  assertValidDate(startUTC);
  assertValidDate(endUTC);

  if (endUTC <= startUTC) {
    throw new Error(
      "Transit series end date must be after start date."
    );
  }

  if (
    !Number.isFinite(stepHours) ||
    stepHours <= 0
  ) {
    throw new Error(
      "stepHours must be greater than zero."
    );
  }

  const results = [];

  const stepMilliseconds =
    stepHours * 60 * 60 * 1000;

  for (
    let timestamp = startUTC.getTime();
    timestamp <= endUTC.getTime();
    timestamp += stepMilliseconds
  ) {
    const dateUTC =
      new Date(timestamp);

    results.push(
      calculateTransitSnapshot(
        dateUTC,
        natalKundali
      )
    );
  }

  return results;
}