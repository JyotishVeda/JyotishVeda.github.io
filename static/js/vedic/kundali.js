/**
 * JyotishVeda — Kundali assembly.
 *
 * Lagna (ascendant) from local sidereal time and geographic latitude, then
 * whole-sign (Rashi) houses, which is the standard North / South Indian
 * convention: the rising rashi is the whole of the 1st bhava.
 */
import { normalizeDegrees, obliquity, DEG, lahiriAyanamsha } from "./ayanamsha.js";
import { rashiFromLongitude, RASHIS, countFrom } from "./rashi.js";
import { nakshatraFromLongitude } from "./nakshatra.js";
import { calculateGrahas } from "./grahas.js";

/** Local sidereal time in degrees (RAMC). */
export function localSiderealDegrees(dateUTC, longitudeEast) {
  if (typeof Astronomy === "undefined") {
    throw new Error("Astronomy Engine has not loaded.");
  }
  const gstHours = Astronomy.SiderealTime(dateUTC);
  return normalizeDegrees(gstHours * 15 + longitudeEast);
}

/**
 * Tropical ascendant in degrees.
 *
 *   Asc = atan2( cos θ , −( sin θ · cos ε + tan φ · sin ε ) )
 *
 * θ = local sidereal time, φ = latitude, ε = obliquity.
 */
export function tropicalAscendant(dateUTC, latitude, longitudeEast) {
  const theta = localSiderealDegrees(dateUTC, longitudeEast) * DEG;
  const eps = obliquity(dateUTC) * DEG;
  const phi = Math.max(-89.9, Math.min(89.9, latitude)) * DEG;

  const y = Math.cos(theta);
  const x = -(Math.sin(theta) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps));
  return normalizeDegrees((Math.atan2(y, x) * 180) / Math.PI);
}

/** Sidereal (Lahiri) ascendant. */
export function siderealAscendant(dateUTC, latitude, longitudeEast) {
  return normalizeDegrees(
    tropicalAscendant(dateUTC, latitude, longitudeEast) - lahiriAyanamsha(dateUTC)
  );
}

/** Tropical Midheaven (10th house cusp in degree terms). */
export function tropicalMidheaven(dateUTC, longitudeEast) {
  const theta = localSiderealDegrees(dateUTC, longitudeEast) * DEG;
  const eps = obliquity(dateUTC) * DEG;
  return normalizeDegrees(
    (Math.atan2(Math.tan(theta), Math.cos(eps)) * 180) / Math.PI +
      (Math.cos(theta) < 0 ? 180 : 0)
  );
}

/**
 * Build a complete kundali.
 *
 * @param {Date}   dateUTC
 * @param {number} latitude   north positive
 * @param {number} longitude  east positive
 */
export function buildKundali(dateUTC, latitude, longitude) {
  const ascLongitude = siderealAscendant(dateUTC, latitude, longitude);
  const lagna = rashiFromLongitude(ascLongitude);
  const grahas = calculateGrahas(dateUTC);

  const houses = [];
  for (let i = 0; i < 12; i += 1) {
    const rashiIndex = (lagna.index + i) % 12;
    houses.push({
      number: i + 1,
      rashi: RASHIS[rashiIndex],
      grahas: [],
    });
  }

  for (const key of grahas.order) {
    const g = grahas[key];
    const houseNumber = countFrom(lagna.index, g.rashi.index);
    g.house = houseNumber;
    houses[houseNumber - 1].grahas.push(g);
  }

  const moon = grahas.chandra;
  const chandraLagnaHouses = grahas.order.map((key) => ({
    key,
    house: countFrom(moon.rashi.index, grahas[key].rashi.index),
  }));

  return {
    dateUTC,
    latitude,
    longitude,
    ayanamsha: grahas.ayanamsha,
    ascendant: {
      longitude: ascLongitude,
      rashi: lagna,
      nakshatra: nakshatraFromLongitude(ascLongitude),
    },
    midheaven: normalizeDegrees(tropicalMidheaven(dateUTC, longitude) - grahas.ayanamsha),
    grahas,
    houses,
    chandraLagnaHouses,
    janmaRashi: moon.rashi,
    janmaNakshatra: moon.nakshatra,
  };
}

/** Name letters traditionally suggested for each nakshatra pada (Namakaran). */
export const PADA_SYLLABLES = Object.freeze({
  1: ["Chu", "Che", "Cho", "La"],
  2: ["Li", "Lu", "Le", "Lo"],
  3: ["A", "I", "U", "E"],
  4: ["O", "Va", "Vi", "Vu"],
  5: ["Ve", "Vo", "Ka", "Ki"],
  6: ["Ku", "Gha", "Ang", "Chha"],
  7: ["Ke", "Ko", "Ha", "Hi"],
  8: ["Hu", "He", "Ho", "Da"],
  9: ["Di", "Du", "De", "Do"],
  10: ["Ma", "Mi", "Mu", "Me"],
  11: ["Mo", "Ta", "Ti", "Tu"],
  12: ["Te", "To", "Pa", "Pi"],
  13: ["Pu", "Sha", "Na", "Tha"],
  14: ["Pe", "Po", "Ra", "Ri"],
  15: ["Ru", "Re", "Ro", "Ta"],
  16: ["Ti", "Tu", "Te", "To"],
  17: ["Na", "Ni", "Nu", "Ne"],
  18: ["No", "Ya", "Yi", "Yu"],
  19: ["Ye", "Yo", "Bha", "Bhi"],
  20: ["Bhu", "Dha", "Pha", "Dha"],
  21: ["Bhe", "Bho", "Ja", "Ji"],
  22: ["Ju", "Je", "Jo", "Gha"],
  23: ["Ga", "Gi", "Gu", "Ge"],
  24: ["Go", "Sa", "Si", "Su"],
  25: ["Se", "So", "Da", "Di"],
  26: ["Du", "Tha", "Jha", "Na"],
  27: ["De", "Do", "Cha", "Chi"],
});

