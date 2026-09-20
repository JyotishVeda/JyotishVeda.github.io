/**
 * JyotishVeda — Rashifal engine (Chandra gochar).
 *
 * Nothing here is random and nothing is pre-written per day. For a chosen
 * janma rashi the engine measures where the transiting grahas actually sit
 * relative to that rashi, then assembles the reading from the classical
 * significations of those transit houses. The same date always produces the
 * same reading, and the reading changes because the sky changed.
 */
import { calculateGrahas } from "./grahas.js";
import { calculatePanchang } from "./panchang.js";
import { RASHIS, rashiByKey, countFrom } from "./rashi.js";

/** Classical gochar strength of the Moon counted from the janma rashi. */
const CHANDRA_GOCHAR = {
  1:  { score: 2,  theme: "self, mood and personal initiative", advice: "Use the day to reset your priorities and act deliberately rather than reactively." },
  2:  { score: -1, theme: "money, food and family conversation", advice: "Keep spending and important family conversations measured; do not rush commitments." },
  3:  { score: 3,  theme: "courage, short travel and siblings", advice: "Initiative is supported today — make the call you have been avoiding." },
  4:  { score: -1, theme: "home, mother and emotional weather indoors", advice: "Domestic friction is easy to start and hard to stop. Slow the pace at home." },
  5:  { score: -1, theme: "children, study and speculation", advice: "Study is fine; speculation is not. Keep money out of experiments today." },
  6:  { score: 3,  theme: "work, competition and health routines", advice: "Rivals lose ground today. Use the day to clear pending obligations." },
  7:  { score: 2,  theme: "partners, contracts and negotiation", advice: "Talks go further than solo effort. Bring the other person into the decision." },
  8:  { score: -2, theme: "delays, hidden matters and fatigue", advice: "Postpone signatures and long journeys if there is any choice about timing." },
  9:  { score: -1, theme: "belief, teachers and long-range plans", advice: "Plans made today need revisiting. Learn rather than commit." },
  10: { score: 2,  theme: "work visibility, seniors and reputation", advice: "Your output is being noticed. Make the visible task the good one." },
  11: { score: 3,  theme: "income, friends and fulfilled requests", advice: "The best transit of the cycle for asking — ask." },
  12: { score: -2, theme: "expense, sleep and withdrawal", advice: "Rest is productive today. Guard against unnecessary spending." },
};

/** Sun by transit house from the janma rashi — the slower background tone. */
const SURYA_GOCHAR = {
  1: "a month centred on the body and on how you are seen",
  2: "a month in which household money and speech carry weight",
  3: "a month that rewards effort, short trips and self-assertion",
  4: "a month of domestic rearrangement and inner tiredness",
  5: "a month for study, children and creative output",
  6: "a strong month for competition, work and clearing debt",
  7: "a month in which partnership questions come to the front",
  8: "a month asking for patience with delays and hidden matters",
  9: "a month favourable to teachers, travel and long-range vision",
  10: "a month in which professional standing is under review",
  11: "one of the year's better months for income and networks",
  12: "a month of expense, seclusion and closing things off",
};

const CAREER_BY_HOUSE = {
  1: "Take the lead on nothing new; finish what already has your name on it.",
  2: "Numbers, invoices and contracts deserve a careful second reading.",
  3: "Reach out directly. Cold approaches and short journeys work today.",
  4: "Work from a settled place. Office politics are best left alone.",
  5: "Creative and analytical work flows; avoid any financial gamble.",
  6: "Competitive situations tilt your way. Handle the difficult task first.",
  7: "Client meetings, interviews and joint decisions are supported.",
  8: "Do not sign, do not launch. Research and repair are better uses of the day.",
  9: "Learning, mentors and long-horizon planning suit the day better than execution.",
  10: "Seniors are watching. Deliver visibly and keep your commitments small.",
  11: "Ask for the raise, the referral or the introduction.",
  12: "Back-office work, documentation and quiet planning are the day's best use.",
};

const LOVE_BY_HOUSE = {
  1: "You are carrying the mood in the relationship today — name it rather than act it out.",
  2: "Conversations about shared money or family expectations surface easily.",
  3: "Small gestures and frequent contact matter more than a grand plan.",
  4: "Domestic comfort is the theme; so is being touchy about home matters.",
  5: "Romance, play and creative time together are favoured.",
  6: "Irritation over chores or health routines is the likely friction point.",
  7: "The partner's view carries unusual weight today. Listen first.",
  8: "Something unspoken wants air. Choose the moment carefully.",
  9: "Difference in belief or long-term direction becomes visible.",
  10: "Work pressure spills into the relationship; protect one hour of it.",
  11: "Friends, gatherings and shared social plans go well.",
  12: "Solitude is not rejection. Say so before it is misread.",
};

const HEALTH_BY_HOUSE = {
  1: "Energy is uneven. Eat on time rather than pushing through.",
  2: "Watch the throat, the teeth and what you eat late at night.",
  3: "Physical activity suits the day; do not overstrain the shoulders.",
  4: "Chest and digestion respond to rest and to a lighter evening meal.",
  5: "Mental fatigue from overthinking is the main risk today.",
  6: "A good day to begin a routine that you intend to keep.",
  7: "Sleep and hydration slip when the day gets social. Track them.",
  8: "Low stamina. Do not test the body with anything new.",
  9: "Hips and lower back respond to stretching; travel tires more than usual.",
  10: "Standing work and posture matter. Break up long sitting.",
  11: "Steady energy — use it, but keep one evening hour free.",
  12: "Sleep debt is the real issue. Sleep is the real remedy.",
};

const VARA_NOTE = {
  Surya:   "Sunday is ruled by Surya — authority, father and self-assertion colour the day.",
  Chandra: "Monday is ruled by Chandra — the day's tone follows the emotions closely.",
  Mangal:  "Tuesday is ruled by Mangal — energy runs hot, so does the temper.",
  Budha:   "Wednesday is ruled by Budha — communication, trade and paperwork move well.",
  Guru:    "Thursday is ruled by Guru — advice, teaching and ethical decisions are favoured.",
  Shukra:  "Friday is ruled by Shukra — comfort, relationships and the arts are supported.",
  Shani:   "Saturday is ruled by Shani — slow, structural work outlasts quick effort.",
};

function ratingFromScore(score) {
  if (score >= 3) return { stars: 5, label: "Strong day" };
  if (score >= 2) return { stars: 4, label: "Favourable" };
  if (score >= 0) return { stars: 3, label: "Mixed" };
  if (score >= -1) return { stars: 2, label: "Slow going" };
  return { stars: 1, label: "Guard the day" };
}

/**
 * Daily rashifal for one janma rashi.
 * @param {string} rashiKey e.g. "mesha"
 * @param {Date}   dateUTC
 * @param {number} offsetHours local UTC offset, used for the weekday
 */
export function dailyRashifal(rashiKey, dateUTC = new Date(), offsetHours = 5.5) {
  const rashi = rashiByKey(rashiKey);
  if (!rashi) throw new RangeError(`Unknown rashi: ${rashiKey}`);

  const grahas = calculateGrahas(dateUTC);
  const panchang = calculatePanchang(dateUTC, offsetHours);

  const moonHouse = countFrom(rashi.index, grahas.chandra.rashi.index);
  const sunHouse = countFrom(rashi.index, grahas.surya.rashi.index);
  const jupiterHouse = countFrom(rashi.index, grahas.guru.rashi.index);
  const saturnHouse = countFrom(rashi.index, grahas.shani.rashi.index);

  const moon = CHANDRA_GOCHAR[moonHouse];
  let score = moon.score;
  if ([2, 5, 7, 9, 11].includes(jupiterHouse)) score += 1;
  if ([1, 2, 4, 8, 12].includes(saturnHouse)) score -= 1;
  if ([3, 6, 11].includes(saturnHouse)) score += 1;

  const rating = ratingFromScore(score);

  const general = [
    `The Moon transits the ${ordinal(moonHouse)} rashi from ${rashi.name}, bringing ${moon.theme} into focus. ${moon.advice}`,
    `Surya is in the ${ordinal(sunHouse)} from your rashi — ${SURYA_GOCHAR[sunHouse]}.`,
    VARA_NOTE[panchang.vara.lord],
    `The running tithi is ${panchang.tithi.paksha} ${panchang.tithi.nameInPaksha} and the Moon is in ${panchang.nakshatra.name} nakshatra (pada ${panchang.nakshatra.pada}), whose lord is ${panchang.nakshatra.lord}.`,
  ].join(" ");

  const background = [];
  if ([2, 5, 7, 9, 11].includes(jupiterHouse)) {
    background.push(`Guru transits the ${ordinal(jupiterHouse)} from your rashi, a supportive long-term position that softens difficult days.`);
  } else {
    background.push(`Guru transits the ${ordinal(jupiterHouse)} from your rashi, so growth this year comes from consolidation rather than expansion.`);
  }
  if ([12, 1, 2].includes(saturnHouse)) {
    background.push(`Shani is in the ${ordinal(saturnHouse)} from your rashi, the Sade Sati span — the theme of the period is endurance.`);
  } else if ([3, 6, 11].includes(saturnHouse)) {
    background.push(`Shani is in the ${ordinal(saturnHouse)} from your rashi, one of its three favourable transit houses.`);
  } else {
    background.push(`Shani is in the ${ordinal(saturnHouse)} from your rashi — steady effort, slow returns.`);
  }

  return {
    rashi,
    date: dateUTC,
    panchang,
    rating,
    score,
    houses: { moon: moonHouse, sun: sunHouse, jupiter: jupiterHouse, saturn: saturnHouse },
    sections: {
      general,
      career: CAREER_BY_HOUSE[moonHouse],
      love: LOVE_BY_HOUSE[moonHouse],
      health: HEALTH_BY_HOUSE[moonHouse],
      background: background.join(" "),
    },
    lucky: {
      colour: rashiColour(rashi.key),
      number: rashiNumber(rashi.key),
      direction: ["East", "South", "West", "North"][moonHouse % 4],
      time: `${(6 + (moonHouse % 6)) % 24}:00 – ${(8 + (moonHouse % 6)) % 24}:00 local`,
    },
  };
}

/** Weekly summary: the Moon's path across the coming seven days. */
export function weeklyRashifal(rashiKey, startUTC = new Date(), offsetHours = 5.5) {
  const days = [];
  let best = null;
  let worst = null;

  for (let i = 0; i < 7; i += 1) {
    const d = new Date(startUTC.getTime() + i * 86400000);
    const r = dailyRashifal(rashiKey, d, offsetHours);
    days.push(r);
    if (!best || r.score > best.score) best = r;
    if (!worst || r.score < worst.score) worst = r;
  }

  return { days, best, worst, rashi: days[0].rashi };
}

function ordinal(n) {
  const suffix = ["th", "st", "nd", "rd"][(n % 100 - 20) % 10] || ["th", "st", "nd", "rd"][n % 100] || "th";
  return `${n}${suffix}`;
}

function rashiColour(key) {
  const map = {
    mesha: "Red", vrishabha: "White", mithuna: "Green", karka: "Silver",
    simha: "Gold", kanya: "Olive green", tula: "Pastel blue", vrishchika: "Maroon",
    dhanu: "Saffron", makara: "Dark blue", kumbha: "Indigo", meena: "Yellow",
  };
  return map[key];
}

function rashiNumber(key) {
  const map = {
    mesha: 9, vrishabha: 6, mithuna: 5, karka: 2, simha: 1, kanya: 5,
    tula: 6, vrishchika: 9, dhanu: 3, makara: 8, kumbha: 8, meena: 3,
  };
  return map[key];
}

export { RASHIS };

