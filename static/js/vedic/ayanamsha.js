/**
 * JyotishVeda — sidereal core
 * Lahiri / Chitrapaksha ayanamsha and angle helpers.
 *
 * Convention used throughout the site:
 *   sidereal longitude = tropical longitude − ayanamsha
 */

export const J2000_JD = 2451545.0;
export const DEG = Math.PI / 180;

/** Lahiri reference value at J2000.0 = 23° 51′ 24″. */
const LAHIRI_J2000_DEG = 23 + 51 / 60 + 24 / 3600;

export function normalizeDegrees(degrees) {
  let value = degrees % 360;
  if (value < 0) value += 360;
  if (value >= 360) value = 0;
  return value;
}

/** JavaScript Date (UTC instant) → Julian Day. */
export function julianDay(dateUTC) {
  if (!(dateUTC instanceof Date) || Number.isNaN(dateUTC.getTime())) {
    throw new TypeError("julianDay() expects a valid Date.");
  }
  return dateUTC.getTime() / 86400000 + 2440587.5;
}

/** Julian centuries elapsed since J2000.0. */
export function julianCenturies(dateUTC) {
  return (julianDay(dateUTC) - J2000_JD) / 36525;
}

/**
 * Lahiri (Chitrapaksha) ayanamsha in degrees.
 * Accumulated precession applied to the J2000.0 reference value.
 */
export function lahiriAyanamsha(dateUTC) {
  const T = julianCenturies(dateUTC);
  const precessionArcsec =
    5038.7784 * T - 1.07259 * T * T - 0.001147 * T * T * T;
  return LAHIRI_J2000_DEG + precessionArcsec / 3600;
}

export function tropicalToSidereal(tropicalLongitude, dateUTC) {
  return normalizeDegrees(tropicalLongitude - lahiriAyanamsha(dateUTC));
}

export function siderealToTropical(siderealLongitude, dateUTC) {
  return normalizeDegrees(siderealLongitude + lahiriAyanamsha(dateUTC));
}

/** Mean obliquity of the ecliptic (degrees). */
export function obliquity(dateUTC) {
  const T = julianCenturies(dateUTC);
  return 23.439291 - 0.0130042 * T - 0.00000016 * T * T + 0.000000504 * T * T * T;
}

/** 47.318512 → "47° 19′ 07″" */
export function formatDMS(degrees) {
  const sign = degrees < 0 ? "-" : "";
  const abs = Math.abs(degrees);
  const d = Math.floor(abs);
  const mFloat = (abs - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  let dd = d, mm = m, ss = s;
  if (ss === 60) { ss = 0; mm += 1; }
  if (mm === 60) { mm = 0; dd += 1; }
  return `${sign}${dd}° ${String(mm).padStart(2, "0")}′ ${String(ss).padStart(2, "0")}″`;
}

/** Degrees inside the current 30° rashi, formatted. */
export function formatSignDegrees(siderealLongitude) {
  return formatDMS(normalizeDegrees(siderealLongitude) % 30);
}

/**
 * Convert local civil date/time plus a UTC offset into a UTC Date.
 * offsetHours: +5.5 for IST, −4 for EDT, and so on.
 */
export function localToUTC(dateString, timeString, offsetHours) {
  const [y, m, d] = String(dateString).split("-").map(Number);
  const [hh, mm] = String(timeString).split(":").map(Number);
  if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm)) {
    throw new RangeError("Invalid date or time supplied.");
  }
  const utcMillis = Date.UTC(y, m - 1, d, hh, mm, 0) - offsetHours * 3600000;
  return new Date(utcMillis);
}

