/**
 * JyotishVeda — Rashi (sidereal sign) mapping.
 * 360° ÷ 12 = 30° per rashi.
 */
import { normalizeDegrees } from "./ayanamsha.js";

export const RASHIS = Object.freeze([
  { index: 0,  key: "mesha",      name: "Mesha",      english: "Aries",       symbol: "♈", lord: "Mangal",  tattva: "Agni",     swabhava: "Chara",       varna: "Kshatriya" },
  { index: 1,  key: "vrishabha",  name: "Vrishabha",  english: "Taurus",      symbol: "♉", lord: "Shukra",  tattva: "Prithvi",  swabhava: "Sthira",      varna: "Vaishya" },
  { index: 2,  key: "mithuna",    name: "Mithuna",    english: "Gemini",      symbol: "♊", lord: "Budha",   tattva: "Vayu",     swabhava: "Dwisvabhava", varna: "Shudra" },
  { index: 3,  key: "karka",      name: "Karka",      english: "Cancer",      symbol: "♋", lord: "Chandra", tattva: "Jala",     swabhava: "Chara",       varna: "Brahmin" },
  { index: 4,  key: "simha",      name: "Simha",      english: "Leo",         symbol: "♌", lord: "Surya",   tattva: "Agni",     swabhava: "Sthira",      varna: "Kshatriya" },
  { index: 5,  key: "kanya",      name: "Kanya",      english: "Virgo",       symbol: "♍", lord: "Budha",   tattva: "Prithvi",  swabhava: "Dwisvabhava", varna: "Vaishya" },
  { index: 6,  key: "tula",       name: "Tula",       english: "Libra",       symbol: "♎", lord: "Shukra",  tattva: "Vayu",     swabhava: "Chara",       varna: "Shudra" },
  { index: 7,  key: "vrishchika", name: "Vrishchika", english: "Scorpio",     symbol: "♏", lord: "Mangal",  tattva: "Jala",     swabhava: "Sthira",      varna: "Brahmin" },
  { index: 8,  key: "dhanu",      name: "Dhanu",      english: "Sagittarius", symbol: "♐", lord: "Guru",    tattva: "Agni",     swabhava: "Dwisvabhava", varna: "Kshatriya" },
  { index: 9,  key: "makara",     name: "Makara",     english: "Capricorn",   symbol: "♑", lord: "Shani",   tattva: "Prithvi",  swabhava: "Chara",       varna: "Vaishya" },
  { index: 10, key: "kumbha",     name: "Kumbha",     english: "Aquarius",    symbol: "♒", lord: "Shani",   tattva: "Vayu",     swabhava: "Sthira",      varna: "Shudra" },
  { index: 11, key: "meena",      name: "Meena",      english: "Pisces",      symbol: "♓", lord: "Guru",    tattva: "Jala",     swabhava: "Dwisvabhava", varna: "Brahmin" },
]);

export function rashiFromLongitude(siderealLongitude) {
  const lon = normalizeDegrees(siderealLongitude);
  const index = Math.floor(lon / 30);
  return { ...RASHIS[index], degreeInSign: lon - index * 30 };
}

export function rashiByKey(key) {
  return RASHIS.find((r) => r.key === String(key).toLowerCase()) || null;
}

/** Count of rashis from a to b, inclusive of both (1..12) — the Vedic way of counting. */
export function countFrom(fromIndex, toIndex) {
  return ((toIndex - fromIndex + 12) % 12) + 1;
}

