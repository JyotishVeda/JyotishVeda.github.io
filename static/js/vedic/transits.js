/**
 * JyotishVeda — dynamic transit engine.
 *
 * This module deliberately separates astronomical/transit facts from
 * interpretation. It calculates the nine grahas for any requested UTC
 * instant using the same sidereal core as the natal Kundali, then compares
 * those positions with a supplied natal Kundali.
 *
 * Current conventions:
 *   - Sidereal longitudes use the site's Lahiri ayanamsha.
 *   - Natal houses are whole-sign houses.
 *   - Transit houses are counted from natal Lagna and natal Moon (Janma Rashi).
 *   - Traditional Parashari graha drishti is exposed as structured data:
 *       every graha -> 7th
 *       Mars -> 4th, 8th
 *       Jupiter -> 5th, 9th
 *       Saturn -> 3rd, 10th
 *   - Rahu/Ketu special aspects are intentionally not assumed here because
 *     traditions differ. They can be added as an explicit convention later.
 *
 * No interpretation is generated in this file. It provides the evidence
 * layer that a future interpretation engine can consume.
 */

import { calculateGrahas } from "./grahas.js";
import { countFrom } from "./rashi.js";

export const TRANSIT_ASPECTS = Object.freeze({
  surya: [7],
  chandra: [7],
  mangal: [4, 7, 8],
  budha: [7],
  guru: [5, 7, 9],
  shukra: [7],
  shani: [3, 7, 10],
  rahu: [7],
  ketu: [7],
});

export const TRANSIT_GRAHA_KEYS = Object.freeze([
  "surya",
  "chandra",
  "mangal",
  "budha",
  "guru",
  "shukra",
  "shani",
  "rahu",
  "ketu",
]);

function requireDate(dateUTC) {
  if (!(dateUTC instanceof Date) || Number.isNaN(dateUTC.getTime())) {
    throw new TypeError("Transit date must be a valid UTC Date.");
  }
}

function normalizeHouseDistance(house) {
  return ((house - 1) % 12 + 12) % 12 + 1;
}

/**
 * Smallest absolute angular separation between two sidereal longitudes.
 * Result is always 0..180 degrees.
 */
export function angularSeparation(a, b) {
  let delta = Math.abs(Number(a) - Number(b)) % 360;
  if (delta > 180) delta = 360 - delta;
  return delta;
}

/**
 * Whole-sign house distance from one rashi index to another.
 */
export function houseDistance(fromRashiIndex, toRashiIndex) {
  return normalizeHouseDistance(toRashiIndex - fromRashiIndex + 1);
}

/**
 * Whether a transit graha casts a traditional Parashari drishti on a
 * natal graha, using whole-sign positions.
 */
export function hasGrahaDrishti(transitKey, transitRashiIndex, natalRashiIndex) {
  const distance = houseDistance(transitRashiIndex, natalRashiIndex);
  const allowed = TRANSIT_ASPECTS[transitKey] || [7];
  return allowed.includes(distance);
}

/**
 * Calculate the sky at an arbitrary UTC instant.
 *
 * This is the foundation for:
 *   - today's sky
 *   - future transits
 *   - historical transits
 *   - transit timelines
 */
export function calculateTransitSky(dateUTC) {
  requireDate(dateUTC);

  const grahas = calculateGrahas(dateUTC);

  return {
    dateUTC: new Date(dateUTC.getTime()),
    ayanamsha: grahas.ayanamsha,
    grahas,
  };
}

/**
 * Compare one transit sky with a natal Kundali.
 *
 * The returned object contains only calculated relationships. It does not
 * turn those relationships into predictions or life-event claims.
 */
export function compareTransitToNatal(transitSky, natalKundali) {
  if (!transitSky || !(transitSky.dateUTC instanceof Date)) {
    throw new TypeError("A valid transit sky is required.");
  }

  if (!natalKundali?.ascendant?.rashi || !natalKundali?.janmaRashi) {
    throw new TypeError("A complete natal Kundali is required.");
  }

  const natalLagnaIndex = natalKundali.ascendant.rashi.index;
  const natalMoonIndex = natalKundali.janmaRashi.index;

  const comparisons = {};

  for (const key of TRANSIT_GRAHA_KEYS) {
    const transit = transitSky.grahas[key];
    if (!transit) continue;

    const transitRashiIndex = transit.rashi.index;

    comparisons[key] = {
      ...transit,

      fromNatalLagna: {
        house: houseDistance(natalLagnaIndex, transitRashiIndex),
      },

      fromNatalMoon: {
        house: houseDistance(natalMoonIndex, transitRashiIndex),
      },

      natalContacts: TRANSIT_GRAHA_KEYS
        .filter((natalKey) => natalKundali.grahas[natalKey])
        .map((natalKey) => {
          const natal = natalKundali.grahas[natalKey];
          const house = houseDistance(transitRashiIndex, natal.rashi.index);

          return {
            natalKey,
            natalLongitude: natal.longitude,
            natalRashi: natal.rashi,
            houseFromTransit: house,
            angularSeparation: angularSeparation(
              transit.longitude,
              natal.longitude
            ),
            sameRashi: transit.rashi.index === natal.rashi.index,
            grahaDrishti: hasGrahaDrishti(
              key,
              transitRashiIndex,
              natal.rashi.index
            ),
          };
        }),
    };
  }

  return {
    dateUTC: new Date(transitSky.dateUTC.getTime()),
    ayanamsha: transitSky.ayanamsha,
    natalLagna: natalKundali.ascendant.rashi,
    natalMoonRashi: natalKundali.janmaRashi,
    grahas: comparisons,
  };
}

/**
 * One-call API for the future interpretation layer:
 * calculate the sky and compare it to a natal chart.
 */
export function calculateTransitSnapshot(dateUTC, natalKundali) {
  const sky = calculateTransitSky(dateUTC);
  return {
    sky,
    comparison: compareTransitToNatal(sky, natalKundali),
  };
}

/**
 * Generate a series of transit snapshots at a fixed interval.
 *
 * The caller controls the resolution. Examples:
 *   24 hours -> daily transit timeline
 *   6 hours  -> intraday timeline
 *
 * The end instant is inclusive when it falls exactly on the interval.
 */
export function calculateTransitSeries(startUTC, endUTC, stepHours, natalKundali = null) {
  requireDate(startUTC);
  requireDate(endUTC);

  const hours = Number(stepHours);

  if (!Number.isFinite(hours) || hours <= 0) {
    throw new RangeError("stepHours must be greater than zero.");
  }

  if (endUTC < startUTC) {
    throw new RangeError("endUTC must not be earlier than startUTC.");
  }

  const stepMs = hours * 3600000;
  const snapshots = [];

  for (
    let cursor = startUTC.getTime();
    cursor <= endUTC.getTime();
    cursor += stepMs
  ) {
    const dateUTC = new Date(cursor);

    snapshots.push(
      natalKundali
        ? calculateTransitSnapshot(dateUTC, natalKundali)
        : { sky: calculateTransitSky(dateUTC) }
    );
  }

  return snapshots;
}
