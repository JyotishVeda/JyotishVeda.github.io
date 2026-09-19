/**
 * JyotishVeda — classical dosha checks.
 *
 * Mangal (Kuja) Dosha, Shani Sade Sati and Dhaiya, and Kaal Sarp Yoga.
 * Each check states which reference point it was measured from, because the
 * answer changes depending on whether you count from the Lagna, the Moon or Venus.
 */
import { countFrom, rashiFromLongitude } from "./rashi.js";
import { calculateGrahas } from "./grahas.js";
import { normalizeDegrees } from "./ayanamsha.js";

const MANGAL_HOUSES = [1, 2, 4, 7, 8, 12];

/**
 * Mangal dosha measured from three reference points.
 * @param {object} kundali output of buildKundali()
 */
export function mangalDosha(kundali) {
  const mars = kundali.grahas.mangal;
  const references = [
    { label: "Lagna (ascendant)", index: kundali.ascendant.rashi.index },
    { label: "Chandra (Moon)", index: kundali.grahas.chandra.rashi.index },
    { label: "Shukra (Venus)", index: kundali.grahas.shukra.rashi.index },
  ];

  const results = references.map((ref) => {
    const house = countFrom(ref.index, mars.rashi.index);
    return { ...ref, house, afflicted: MANGAL_HOUSES.includes(house) };
  });

  const count = results.filter((r) => r.afflicted).length;
  let severity;
  if (count === 0) severity = "No Mangal dosha found from any of the three reference points";
  else if (count === 1) severity = "Partial (anshik) Mangal dosha";
  else if (count === 2) severity = "Moderate Mangal dosha";
  else severity = "Strong Mangal dosha from all three reference points";

  const cancellations = [];
  if (["mesha", "vrishchika", "makara"].includes(mars.rashi.key)) {
    cancellations.push("Mars sits in its own sign or exaltation sign, which many texts treat as a cancellation.");
  }
  if (["karka", "simha", "kumbha", "meena"].includes(kundali.ascendant.rashi.key)) {
    cancellations.push("Several traditions cancel the dosha for particular lagnas, including this one.");
  }
  if (mars.rashi.index === kundali.grahas.guru.rashi.index) {
    cancellations.push("Jupiter is in the same rashi as Mars, a widely accepted mitigating factor.");
  }

  return { graha: mars, results, count, severity, cancellations, houses: MANGAL_HOUSES };
}

/**
 * Sade Sati — Saturn transiting the 12th, 1st and 2nd rashis from the natal Moon.
 * @param {object} natalMoonRashi rashi object of the natal Moon
 * @param {Date}   atDate
 */
export function sadeSati(natalMoonRashi, atDate = new Date()) {
  const grahas = calculateGrahas(atDate);
  const saturn = grahas.shani;
  const position = countFrom(natalMoonRashi.index, saturn.rashi.index);

  let phase = null;
  let active = false;
  if (position === 12) { phase = "First phase (Rising) — Saturn in the 12th from the Moon"; active = true; }
  else if (position === 1) { phase = "Second phase (Peak) — Saturn over the Moon's own rashi"; active = true; }
  else if (position === 2) { phase = "Third phase (Setting) — Saturn in the 2nd from the Moon"; active = true; }

  let dhaiya = null;
  if (position === 4) dhaiya = "Kantaka Shani (Ardha Ashtama) — Saturn in the 4th from the Moon";
  if (position === 8) dhaiya = "Ashtama Shani — Saturn in the 8th from the Moon";

  return {
    saturn,
    natalMoonRashi,
    position,
    active,
    phase,
    dhaiya,
    retrograde: saturn.retrograde,
  };
}

/**
 * Kaal Sarp Yoga — all seven non-nodal grahas on one side of the Rahu–Ketu axis.
 */
export function kaalSarp(kundali) {
  const rahu = kundali.grahas.rahu.longitude;
  const ketu = kundali.grahas.ketu.longitude;
  const others = ["surya", "chandra", "mangal", "budha", "guru", "shukra", "shani"]
    .map((k) => kundali.grahas[k]);

  const arcFromRahu = others.map((g) => normalizeDegrees(g.longitude - rahu));
  const allBetween = arcFromRahu.every((a) => a < 180);
  const allOutside = arcFromRahu.every((a) => a > 180);

  return {
    present: allBetween || allOutside,
    side: allBetween ? "Rahu to Ketu" : allOutside ? "Ketu to Rahu" : null,
    rahuRashi: rashiFromLongitude(rahu),
    ketuRashi: rashiFromLongitude(ketu),
    note: "Partial or 'broken' Kaal Sarp is counted differently by different schools; this check requires every one of the seven grahas to be on a single side.",
  };
}

