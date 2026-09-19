/**
 * JyotishVeda — graha positions.
 *
 * Tropical geocentric longitudes come from Astronomy Engine (loaded globally
 * as `Astronomy`). This module converts them to sidereal longitudes using the
 * Lahiri ayanamsha and adds Rahu / Ketu from the Moon's mean node.
 */
import {
  normalizeDegrees,
  lahiriAyanamsha,
  julianCenturies,
} from "./ayanamsha.js";
import { rashiFromLongitude } from "./rashi.js";
import { nakshatraFromLongitude } from "./nakshatra.js";

export const GRAHA_LIST = Object.freeze([
  { key: "surya",   name: "Surya",   english: "Sun",     short: "Su", body: "Sun" },
  { key: "chandra", name: "Chandra", english: "Moon",    short: "Mo", body: "Moon" },
  { key: "mangal",  name: "Mangal",  english: "Mars",    short: "Ma", body: "Mars" },
  { key: "budha",   name: "Budha",   english: "Mercury", short: "Bu", body: "Mercury" },
  { key: "guru",    name: "Guru",    english: "Jupiter", short: "Gu", body: "Jupiter" },
  { key: "shukra",  name: "Shukra",  english: "Venus",   short: "Sk", body: "Venus" },
  { key: "shani",   name: "Shani",   english: "Saturn",  short: "Sa", body: "Saturn" },
  { key: "rahu",    name: "Rahu",    english: "N. Node", short: "Ra", body: null },
  { key: "ketu",    name: "Ketu",    english: "S. Node", short: "Ke", body: null },
]);

function requireEngine() {
  if (typeof Astronomy === "undefined") {
    throw new Error("Astronomy Engine has not loaded. Check your connection and reload.");
  }
  return Astronomy;
}

/** Tropical geocentric ecliptic longitude of a body, degrees. */
export function tropicalLongitude(bodyName, dateUTC) {
  const A = requireEngine();
  const vector = A.GeoVector(bodyName, dateUTC, true);
  return normalizeDegrees(A.Ecliptic(vector).elon);
}

/** Mean ascending node of the Moon (Rahu), degrees. */
export function meanRahu(dateUTC) {
  const T = julianCenturies(dateUTC);
  const omega =
    125.0445479 -
    1934.1362891 * T +
    0.0020754 * T * T +
    (T * T * T) / 467441 -
    (T * T * T * T) / 60616000;
  return normalizeDegrees(omega);
}

function decorate(key, siderealLongitude, retrograde) {
  const meta = GRAHA_LIST.find((g) => g.key === key);
  const rashi = rashiFromLongitude(siderealLongitude);
  const nakshatra = nakshatraFromLongitude(siderealLongitude);
  return {
    ...meta,
    longitude: siderealLongitude,
    retrograde,
    rashi,
    nakshatra,
  };
}

/**
 * All nine grahas in sidereal longitude for a UTC instant.
 * Returns an object keyed by graha key plus an `order` array.
 */
export function calculateGrahas(dateUTC) {
  const ayanamsha = lahiriAyanamsha(dateUTC);
  const later = new Date(dateUTC.getTime() + 6 * 3600 * 1000);
  const result = {};

  for (const g of GRAHA_LIST) {
    if (!g.body) continue;
    const tropical = tropicalLongitude(g.body, dateUTC);
    const tropicalLater = tropicalLongitude(g.body, later);
    let delta = tropicalLater - tropical;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const sidereal = normalizeDegrees(tropical - ayanamsha);
    result[g.key] = decorate(g.key, sidereal, delta < 0);
  }

  const rahuTropical = meanRahu(dateUTC);
  const rahuSidereal = normalizeDegrees(rahuTropical - ayanamsha);
  result.rahu = decorate("rahu", rahuSidereal, true);
  result.ketu = decorate("ketu", normalizeDegrees(rahuSidereal + 180), true);

  result.ayanamsha = ayanamsha;
  result.order = GRAHA_LIST.map((g) => g.key);
  return result;
}

/** Sidereal longitude of the Moon alone — the cheapest call for rashi/nakshatra work. */
export function moonSidereal(dateUTC) {
  const tropical = tropicalLongitude("Moon", dateUTC);
  return normalizeDegrees(tropical - lahiriAyanamsha(dateUTC));
}

/** Sidereal longitude of the Sun alone. */
export function sunSidereal(dateUTC) {
  const tropical = tropicalLongitude("Sun", dateUTC);
  return normalizeDegrees(tropical - lahiriAyanamsha(dateUTC));
}

