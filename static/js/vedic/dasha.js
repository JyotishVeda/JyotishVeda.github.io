/**
 * JyotishVeda — Vimshottari Dasha.
 *
 * The 120-year cycle is anchored to the Moon's nakshatra at birth. The part of
 * the nakshatra already crossed is the part of that lord's period already spent,
 * so the balance at birth is:
 *
 *   balance = (1 − fraction elapsed) × lord's years
 */
import { nakshatraFromLongitude } from "./nakshatra.js";

export const DAYS_PER_YEAR = 365.2425;

export const DASHA_SEQUENCE = Object.freeze([
  { lord: "Ketu",    english: "Ketu",    years: 7 },
  { lord: "Shukra",  english: "Venus",   years: 20 },
  { lord: "Surya",   english: "Sun",     years: 6 },
  { lord: "Chandra", english: "Moon",    years: 10 },
  { lord: "Mangal",  english: "Mars",    years: 7 },
  { lord: "Rahu",    english: "Rahu",    years: 18 },
  { lord: "Guru",    english: "Jupiter", years: 16 },
  { lord: "Shani",   english: "Saturn",  years: 19 },
  { lord: "Budha",   english: "Mercury", years: 17 },
]);

export const TOTAL_YEARS = 120;

function sequenceIndexForLord(lord) {
  const i = DASHA_SEQUENCE.findIndex((d) => d.lord === lord);
  return i === -1 ? 0 : i;
}

function addYears(date, years) {
  return new Date(date.getTime() + years * DAYS_PER_YEAR * 86400000);
}

/**
 * Mahadasha sequence from a birth instant and the Moon's sidereal longitude.
 * Returns the balance at birth plus the following mahadashas covering 120 years.
 */
export function vimshottariMahadashas(birthUTC, moonSiderealLongitude) {
  const nak = nakshatraFromLongitude(moonSiderealLongitude);
  const startIndex = sequenceIndexForLord(nak.lord);
  const first = DASHA_SEQUENCE[startIndex];
  const balanceYears = (1 - nak.fractionElapsed) * first.years;

  const periods = [];
  let cursor = new Date(birthUTC.getTime());

  periods.push({
    ...first,
    start: new Date(cursor.getTime()),
    end: addYears(cursor, balanceYears),
    years: balanceYears,
    fullYears: first.years,
    partial: true,
  });
  cursor = addYears(cursor, balanceYears);

  for (let step = 1; step < 9; step += 1) {
    const entry = DASHA_SEQUENCE[(startIndex + step) % 9];
    const end = addYears(cursor, entry.years);
    periods.push({
      ...entry,
      start: new Date(cursor.getTime()),
      end,
      fullYears: entry.years,
      partial: false,
    });
    cursor = end;
  }

  return {
    nakshatra: nak,
    balanceYears,
    balanceText: describeDuration(balanceYears),
    periods,
  };
}

/** Antardashas (bhuktis) inside one mahadasha. */
export function antardashas(mahadasha) {
  const startIndex = sequenceIndexForLord(mahadasha.lord);
  const spanYears = mahadasha.fullYears;
  const out = [];
  let cursor = new Date(mahadasha.start.getTime());

  for (let step = 0; step < 9; step += 1) {
    const sub = DASHA_SEQUENCE[(startIndex + step) % 9];
    const years = (spanYears * sub.years) / TOTAL_YEARS;
    const end = addYears(cursor, years);
    out.push({ ...sub, years, start: new Date(cursor.getTime()), end });
    cursor = end;
  }
  return out;
}

/** The mahadasha (and antardasha) running at a given instant. */
export function currentDasha(result, atDate = new Date()) {
  const maha = result.periods.find((p) => atDate >= p.start && atDate < p.end);
  if (!maha) return null;
  const subs = antardashas({ ...maha, fullYears: maha.fullYears, start: dashaTrueStart(maha) });
  const antar = subs.find((s) => atDate >= s.start && atDate < s.end) || null;
  return { maha, antar };
}

/**
 * For a partial first mahadasha, the antardasha grid still has to be measured
 * from the notional start of the full period, not from birth.
 */
function dashaTrueStart(maha) {
  if (!maha.partial) return maha.start;
  const spent = maha.fullYears - maha.years;
  return new Date(maha.start.getTime() - spent * DAYS_PER_YEAR * 86400000);
}

export function describeDuration(years) {
  const whole = Math.floor(years);
  const monthsFloat = (years - whole) * 12;
  const months = Math.floor(monthsFloat);
  const days = Math.round((monthsFloat - months) * 30.44);
  return `${whole}y ${months}m ${days}d`;
}

export function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

