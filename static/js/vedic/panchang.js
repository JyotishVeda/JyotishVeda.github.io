/**
 * JyotishVeda — Panchang (the five limbs).
 *
 *   Vara     — weekday, counted from sunrise
 *   Tithi    — floor((Moon − Sun) / 12°) + 1
 *   Nakshatra— Moon's sidereal nakshatra
 *   Yoga     — floor((Moon + Sun) / 13°20′) + 1
 *   Karana   — half of a tithi (6° of elongation)
 */
import { normalizeDegrees } from "./ayanamsha.js";
import { nakshatraFromLongitude, NAKSHATRA_SPAN } from "./nakshatra.js";
import { moonSidereal, sunSidereal } from "./grahas.js";
import { rashiFromLongitude } from "./rashi.js";

export const VARAS = Object.freeze([
  { name: "Ravivara",    english: "Sunday",    lord: "Surya" },
  { name: "Somavara",    english: "Monday",    lord: "Chandra" },
  { name: "Mangalavara", english: "Tuesday",   lord: "Mangal" },
  { name: "Budhavara",   english: "Wednesday", lord: "Budha" },
  { name: "Guruvara",    english: "Thursday",  lord: "Guru" },
  { name: "Shukravara",  english: "Friday",    lord: "Shukra" },
  { name: "Shanivara",   english: "Saturday",  lord: "Shani" },
]);

export const TITHI_NAMES = Object.freeze([
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya",
]);

export const YOGA_NAMES = Object.freeze([
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana",
  "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
  "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
  "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva",
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
  "Indra", "Vaidhriti",
]);

const MOVABLE_KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"];

/** Karana index (1–60 half-tithis) → name, handling the four fixed karanas. */
export function karanaName(halfTithiIndex) {
  const n = halfTithiIndex; // 1-based, 1..60
  if (n === 1) return "Kimstughna";
  if (n >= 58) return ["Shakuni", "Chatushpada", "Naga"][n - 58];
  return MOVABLE_KARANAS[(n - 2) % 7];
}

/**
 * Full panchang for a UTC instant.
 * `offsetHours` is only used to name the weekday in local terms.
 */
export function calculatePanchang(dateUTC, offsetHours = 0) {
  const sun = sunSidereal(dateUTC);
  const moon = moonSidereal(dateUTC);

  const elongation = normalizeDegrees(moon - sun);
  const tithiIndex = Math.floor(elongation / 12); // 0..29
  const tithiProgress = (elongation % 12) / 12;
  const paksha = tithiIndex < 15 ? "Shukla" : "Krishna";

  const halfTithi = Math.floor(elongation / 6) + 1; // 1..60
  const yogaValue = normalizeDegrees(sun + moon);
  const yogaIndex = Math.floor(yogaValue / NAKSHATRA_SPAN);

  const local = new Date(dateUTC.getTime() + offsetHours * 3600000);
  const varaIndex = local.getUTCDay();

  const nakshatra = nakshatraFromLongitude(moon);

  return {
    sunLongitude: sun,
    moonLongitude: moon,
    sunRashi: rashiFromLongitude(sun),
    moonRashi: rashiFromLongitude(moon),
    vara: VARAS[varaIndex],
    tithi: {
      number: tithiIndex + 1,
      nameInPaksha: TITHI_NAMES[tithiIndex],
      paksha,
      numberInPaksha: (tithiIndex % 15) + 1,
      progress: tithiProgress,
      elongation,
    },
    nakshatra,
    yoga: { number: yogaIndex + 1, name: YOGA_NAMES[yogaIndex] },
    karana: { number: halfTithi, name: karanaName(halfTithi) },
    moonPhasePercent: Math.round((1 - Math.cos(elongation * Math.PI / 180)) / 2 * 100),
  };
}

/** Rough UTC instant at which the current tithi ends (iterative bisection). */
export function approximateTithiEnd(dateUTC, stepMinutes = 10, maxHours = 30) {
  const start = calculatePanchang(dateUTC).tithi.number;
  let cursor = new Date(dateUTC.getTime());
  const limit = dateUTC.getTime() + maxHours * 3600000;
  while (cursor.getTime() < limit) {
    cursor = new Date(cursor.getTime() + stepMinutes * 60000);
    if (calculatePanchang(cursor).tithi.number !== start) return cursor;
  }
  return null;
}

