/**
 * VedicJyoti / JyotishVeda — Upchar & Sadhana (remedy) engine.
 *
 * Classical remedial astrology follows a real rule this module tries to
 * respect rather than flatten: a graha is not "good" or "bad" in the
 * abstract. What matters is what it rules FROM YOUR LAGNA.
 *
 *   - A graha ruling a kendra (1,4,7,10) or trikona (1,5,9) house is a
 *     FUNCTIONAL BENEFIC for this chart — worth strengthening, especially
 *     if it is currently weak.
 *   - A graha ruling only dusthana houses (6,8,12) is a FUNCTIONAL MALEFIC
 *     for this chart — classical guidance is to PACIFY it (charity, mantra,
 *     lifestyle), not to strengthen it with a gemstone.
 *   - A graha ruling both kinds is "mixed" and gets a balanced approach.
 *   - Rahu and Ketu never rule signs, so they are always approached with
 *     pacification, scaled by how afflicted they currently are.
 *
 * This distinction — never suggested by a page that reads only "Mars is in
 * your 6th house, wear red coral" — is the difference between a genuinely
 * useful remedy page and a generic one.
 */
import { GRAHA_PROFILES, GRAHA_DIGNITY, RASHI_LORD_KEY, DIGNITY_LABEL, dignityOf } from "./graha-interpretations.js";
import { currentDasha, vimshottariMahadashas } from "./dasha.js";

/* ---------------------------------------------------------------- remedy data ---------------------------------------------------------------- */

export const REMEDY_PROFILES = Object.freeze({
  surya: {
    deity: "Surya Narayana, or Lord Shiva as the source Surya bows to",
    mantra: "Om Suryaya Namah", extendedMantra: "Om Hram Hreem Hraum Sah Suryaya Namah",
    japa: "108 times at sunrise, ideally facing east", day: "Sunday",
    gemstone: "Ruby (Manik)",
    gemstoneCaution: "Trial it on the skin for a few days first — if it brings irritability, headaches or restlessness rather than confidence, it is not agreeing with this chart.",
    substituteGem: "Red garnet", metal: "Copper or gold",
    colorsFavor: ["Red", "Orange", "Maroon", "Gold"],
    colorsAvoid: ["Head-to-toe black or dark grey on Sundays"],
    charity: ["Wheat", "jaggery", "copper vessels", "red cloth — given on a Sunday, ideally to an elderly man or at a temple"],
    addToLife: ["Greeting the sunrise with a few minutes outdoors or an Arghya (water) offering", "showing active respect to your father and to figures of authority", "regular time in daylight"],
    avoidInLife: ["Arrogance or contempt toward authority", "prolonged self-isolation from daylight and society", "strained relations with your father left unaddressed"],
    fasting: "A Sunday fast — one salt-free meal — is the traditional Surya vrata.",
    yantra: "Surya Yantra, placed facing east", direction: "East",
  },
  chandra: {
    deity: "Parvati, or Shiva as Chandrashekhara",
    mantra: "Om Chandraya Namah", extendedMantra: "Om Shram Shreem Shraum Sah Chandraya Namah",
    japa: "108 times on Monday evening", day: "Monday",
    gemstone: "Pearl (Moti)",
    gemstoneCaution: "Insist on a natural, untreated pearl. If the Moon is badly afflicted, several traditions advise stabilising the mind through mantra and lifestyle first, and trialling pearl only afterward.",
    substituteGem: "Moonstone", metal: "Silver",
    colorsFavor: ["White", "Cream", "Silver", "Sea-green"],
    colorsAvoid: ["Harsh, overstimulating colors on days the mind already feels unsettled"],
    charity: ["Rice", "milk", "white cloth", "silver — especially to mothers or women, or on a Monday"],
    addToLife: ["A steady, protected sleep schedule", "time near water", "honest, warm contact with your mother", "a quiet reflective period each evening"],
    avoidInLife: ["Overthinking late at night", "suppressing rather than processing emotion", "an erratic sleep schedule"],
    fasting: "A Monday fast, taking only milk or fruit, is the traditional Chandra vrata.",
    yantra: "Chandra Yantra", direction: "North-west",
  },
  mangal: {
    deity: "Kartikeya (Murugan), or Hanuman as Mars's classical pacifier",
    mantra: "Om Angarakaya Namah", extendedMantra: "Om Kram Kreem Kraum Sah Bhaumaya Namah",
    japa: "108 times on Tuesday morning", day: "Tuesday",
    gemstone: "Red coral (Moonga)",
    gemstoneCaution: "Should be natural and untreated. Avoid if you have high blood pressure or already run hot-tempered — coral is said to intensify Mars's heat.",
    substituteGem: "Carnelian", metal: "Copper",
    colorsFavor: ["Red", "Coral", "Orange"],
    colorsAvoid: ["Dressing or behaving in a way designed to provoke confrontation"],
    charity: ["Red lentils (masoor dal)", "jaggery", "red cloth — or donating blood, a modern equivalent of Mars-linked charity"],
    addToLife: ["Regular physical exercise as an outlet for raw energy", "Hanuman Chalisa recitation, especially on Tuesdays", "disciplined competitive or physical activity"],
    avoidInLife: ["Impulsive confrontation", "reckless driving or careless handling of sharp tools", "lending or borrowing money on a Tuesday", "excess alcohol if it worsens temper"],
    fasting: "A Tuesday fast, avoiding salt, is the traditional Mangal vrata.",
    yantra: "Mangal Yantra", direction: "South",
  },
  budha: {
    deity: "Vishnu, or Ganesha as remover of confusion",
    mantra: "Om Budhaya Namah", extendedMantra: "Om Bram Breem Braum Sah Budhaya Namah",
    japa: "108 times on Wednesday", day: "Wednesday",
    gemstone: "Emerald (Panna)",
    gemstoneCaution: "Avoid without a practitioner's review if Mercury is heavily afflicted by Rahu or Ketu in your chart — a poorly matched emerald can worsen nervous restlessness rather than calm it.",
    substituteGem: "Peridot", metal: "Bronze or brass",
    colorsFavor: ["Green"],
    colorsAvoid: ["Loud, clashing colors on days you need clarity in speech or negotiation"],
    charity: ["Green gram (moong dal)", "green vegetables", "books or stationery — especially to students"],
    addToLife: ["Deliberate study and skill-building", "clear, honest speech", "feeding green fodder to cows on Wednesdays"],
    avoidInLife: ["Gossip and half-truths", "signing contracts in haste", "taking on too many subjects or commitments at once"],
    fasting: "A Wednesday fast, favouring green foods, is the traditional Budha vrata.",
    yantra: "Budha Yantra", direction: "North",
  },
  guru: {
    deity: "Brihaspati, or Dakshinamurti as the silent teacher",
    mantra: "Om Gurave Namah", extendedMantra: "Om Gram Greem Graum Sah Gurave Namah",
    japa: "108 times on Thursday morning", day: "Thursday",
    gemstone: "Yellow sapphire (Pukhraj)",
    gemstoneCaution: "One of the gentler gemstones to trial, but still insist on natural and untreated — never heated or synthetic.",
    substituteGem: "Citrine", metal: "Gold",
    colorsFavor: ["Yellow", "Saffron", "Gold"],
    colorsAvoid: ["No strong prohibition, though dark, sombre colors are traditionally avoided on Thursdays"],
    charity: ["Turmeric", "chana dal (Bengal gram)", "yellow cloth", "books, or direct support for a teacher or student"],
    addToLife: ["Study of ethics or scripture", "visible respect for teachers and elders", "generosity toward anyone seeking knowledge"],
    avoidInLife: ["Overindulgence and excess — Jupiter's own besetting risk when unchecked", "arrogance about your own wisdom", "neglecting a teacher's or mentor's guidance"],
    fasting: "A Thursday fast, avoiding salt and favouring yellow foods, is the traditional Guru vrata.",
    yantra: "Guru Yantra", direction: "North-east",
  },
  shukra: {
    deity: "Lakshmi, or Shukracharya directly",
    mantra: "Om Shukraya Namah", extendedMantra: "Om Dram Dreem Draum Sah Shukraya Namah",
    japa: "108 times on Friday", day: "Friday",
    gemstone: "Diamond (Heera)",
    gemstoneCaution: "A genuine diamond is costly; a natural white sapphire is a widely accepted, more affordable substitute with a comparable effect.",
    substituteGem: "White sapphire or white zircon", metal: "Silver or platinum",
    colorsFavor: ["White", "Pastel blue", "Pink"],
    colorsAvoid: ["Neglected or unkempt presentation — Venus responds to visible care"],
    charity: ["White sweets", "perfume", "white clothing, or direct support toward a woman's education or wellbeing"],
    addToLife: ["Making room for art, music or beauty in ordinary life", "honouring committed relationships deliberately, not just comfortably", "treating comfort as something to share"],
    avoidInLife: ["Overindulgence in luxury or romance at the cost of duty", "vanity", "infidelity or excess spending on pleasure"],
    fasting: "A Friday fast is the traditional Shukra vrata.",
    yantra: "Shukra Yantra", direction: "South-east",
  },
  shani: {
    deity: "Shani Dev, with Hanuman as his classical pacifier",
    mantra: "Om Shanaischaraya Namah", extendedMantra: "Om Pram Preem Praum Sah Shanaischaraya Namah",
    japa: "108 times on Saturday", day: "Saturday",
    gemstone: "Blue sapphire (Neelam)",
    gemstoneCaution: "The single most unpredictable gemstone in the system — it can act very fast, for better or worse. Never buy one without trialling it on the skin for several days first, and never wear it at all if Saturn is a functional malefic for your lagna (see below).",
    substituteGem: "Amethyst", metal: "Iron or steel",
    colorsFavor: ["Dark blue", "Grey", "Black in moderation"],
    colorsAvoid: ["Bright, celebratory colors when Saturn is heavily afflicted — restraint suits Saturn better than display"],
    charity: ["Black sesame seeds", "mustard oil", "iron", "black cloth or shoes — traditionally given to the poor, labourers or the elderly, especially on Saturdays"],
    addToLife: ["Discipline kept even when no one is watching", "patience with slow results", "practical service to the underprivileged and elderly", "honest labour"],
    avoidInLife: ["Disrespect toward servants, labourers or the elderly", "laziness and cut corners", "unkindness toward crows or dogs, traditionally associated with Shani"],
    fasting: "A Saturday fast, avoiding salt and oil, is the traditional Shani vrata.",
    yantra: "Shani Yantra", direction: "West",
  },
  rahu: {
    deity: "Durga, or Kaal Bhairav",
    mantra: "Om Rahave Namah", extendedMantra: "Om Bhram Bhreem Bhraum Sah Rahave Namah",
    japa: "108 times, traditionally at dusk on Saturday", day: "Saturday (shared with Shani in many traditions)",
    gemstone: "Hessonite (Gomed)",
    gemstoneCaution: "Best worn only under a practitioner's direct guidance — Rahu's effects are unusually context-dependent, and a mismatch can amplify anxiety rather than calm it. This site does not recommend self-prescribing it.",
    substituteGem: "No widely accepted substitute", metal: "Lead or mixed alloys",
    colorsFavor: ["Smoky grey", "Brown"],
    colorsAvoid: ["Impulsively adopting trends, substances or shortcuts associated with escapism"],
    charity: ["Mustard oil", "black gram (urad dal)", "coconut", "blankets — given away, especially on a Saturday"],
    addToLife: ["Grounding practices such as meditation or time in nature", "patient, honestly-earned ambition"],
    avoidInLife: ["Intoxicants", "deception or shortcuts", "obsessive attachment to status symbols or the unfamiliar", "gambling and speculation driven by craving rather than analysis"],
    fasting: "Some traditions keep a Saturday fast for Rahu alongside Shani.",
    yantra: "Rahu Yantra", direction: "South-west",
  },
  ketu: {
    deity: "Ganesha, or Chitragupta",
    mantra: "Om Ketave Namah", extendedMantra: "Om Sram Sreem Sraum Sah Ketave Namah",
    japa: "108 times, traditionally on Tuesday", day: "Tuesday (shared with Mangal in many traditions)",
    gemstone: "Cat's eye (Lehsunia)",
    gemstoneCaution: "Like Rahu's stone, best trialled only after a practitioner's review — a mismatched cat's eye can intensify Ketu's detaching pull in unhelpful ways rather than easing it.",
    substituteGem: "No widely accepted substitute", metal: "Mixed alloys",
    colorsFavor: ["Grey", "Brown", "Multi-coloured"],
    colorsAvoid: ["Using 'detachment' as an excuse to withdraw from responsibilities that are actually yours to carry"],
    charity: ["Sesame seeds", "a blanket", "multi-grain foods — given away, especially on a Tuesday"],
    addToLife: ["Meditation and spiritual study", "honouring inherited skills rather than dismissing them", "deliberately finishing what you start"],
    avoidInLife: ["Neglecting duties in the name of detachment", "isolating from family", "dismissing others' effort as unimportant"],
    fasting: "Some traditions keep a Tuesday fast for Ketu alongside Mangal.",
    yantra: "Ketu Yantra", direction: "North-west",
  },
});

/* ---------------------------------------------------------------- functional nature ---------------------------------------------------------------- */

const KENDRA = [1, 4, 7, 10];
const TRIKONA = [1, 5, 9];
const DUSTHANA = [6, 8, 12];
const MARAKA = [2, 7];

/**
 * Which houses (counted from the lagna) each of the seven classical grahas
 * rules in this specific chart, from the actual rashi occupying each bhava.
 */
function houseLordshipMap(kundali) {
  const map = { surya: [], chandra: [], mangal: [], budha: [], guru: [], shukra: [], shani: [] };
  kundali.houses.forEach((house) => {
    const lordKey = RASHI_LORD_KEY[house.rashi.key];
    if (map[lordKey]) map[lordKey].push(house.number);
  });
  return map;
}

/**
 * @returns {{nature: string, housesRuled: number[], isLagnaLord: boolean}}
 * nature is one of: "yogakaraka" | "benefic" | "mixed" | "malefic" | "maraka" | "neutral" | "shadow"
 */
function functionalNature(grahaKey, housesRuled) {
  if (grahaKey === "rahu" || grahaKey === "ketu") {
    return { nature: "shadow", housesRuled: [], isLagnaLord: false };
  }
  const isLagnaLord = housesRuled.includes(1);
  const hitsKendra = housesRuled.some((h) => KENDRA.includes(h));
  const hitsTrikona = housesRuled.some((h) => TRIKONA.includes(h));
  const hitsDusthanaOnly = housesRuled.length > 0 && housesRuled.every((h) => DUSTHANA.includes(h));
  const hitsMarakaOnly = housesRuled.length > 0 && housesRuled.every((h) => MARAKA.includes(h));
  const hitsAngleOrTrine = hitsKendra || hitsTrikona;
  const hitsDusthanaAlso = housesRuled.some((h) => DUSTHANA.includes(h));

  // A single graha owning only the lagna sign trivially satisfies "kendra and
  // trikona" (house 1 is always both), which is not what the classical term
  // "yogakaraka" means. Real yogakaraka status requires the kendra and the
  // trikona to come from genuinely different owned signs.
  const trivialLagnaOnly = housesRuled.length === 1 && housesRuled[0] === 1;

  let nature;
  if (hitsKendra && hitsTrikona && !trivialLagnaOnly) nature = "yogakaraka";
  else if (hitsDusthanaOnly) nature = "malefic";
  else if (hitsAngleOrTrine && hitsDusthanaAlso) nature = "mixed";
  else if (hitsAngleOrTrine) nature = "benefic";
  else if (hitsMarakaOnly) nature = "maraka";
  else nature = "neutral";

  return { nature, housesRuled, isLagnaLord };
}

const NATURE_LABEL = Object.freeze({
  yogakaraka: "Yogakaraka for your lagna", benefic: "Functional benefic", mixed: "Mixed significator",
  malefic: "Functional malefic", maraka: "Maraka (2nd/7th) significator", neutral: "Neutral significator",
  shadow: "Shadow graha",
});

/* ---------------------------------------------------------------- approach ---------------------------------------------------------------- */

const WEAK_DIGNITIES = ["debilitated", "enemy"];
const STRONG_DIGNITIES = ["own", "moolatrikona", "exalted", "friend"];

/**
 * @returns {{approach: string, rationale: string}} approach is one of:
 *   "strengthen" | "maintain" | "balance" | "pacify"
 */
function approachFor({ grahaKey, nature, dignity, house, retrograde, isLagnaLord }) {
  const weak = WEAK_DIGNITIES.includes(dignity);
  const strong = STRONG_DIGNITIES.includes(dignity);
  const inDusthana = DUSTHANA.includes(house);
  const gName = GRAHA_PROFILES[grahaKey].name;

  if (nature === "shadow") {
    const severity = weak || inDusthana ? "notably" : "mildly";
    return {
      approach: "pacify",
      rationale: `${gName} is a shadow graha and is always approached through pacification rather than strengthening. Its current placement calls for ${severity} active remedy — see the notes below rather than a gemstone.`,
    };
  }

  if (nature === "malefic") {
    const note = strong
      ? `${gName} rules only difficult houses (6th, 8th and/or 12th) from your lagna, but is currently well placed, which keeps its difficulty muted. Light-touch pacification — mainly charity and mantra — is enough; a gemstone is not advised for a functional malefic regardless of its dignity.`
      : `${gName} rules only difficult houses (6th, 8th and/or 12th) from your lagna${weak ? " and is currently weak, which classical texts treat as an added reason for caution rather than for strengthening" : ""}. Pacification (charity, mantra, lifestyle) is the classical approach — a gemstone is not advised for a functional malefic.`;
    return { approach: "pacify", rationale: note };
  }

  if (nature === "yogakaraka") {
    return weak
      ? { approach: "strengthen", rationale: `${gName} is a yogakaraka for your lagna — it rules both an angle and a trine, making it one of the most auspicious significators in your chart — yet it is currently weak. Classical guidance is to actively strengthen it.` }
      : { approach: "maintain", rationale: `${gName} is a yogakaraka for your lagna and is already well placed. The guidance here is to protect and maintain this strength rather than to add anything dramatic.` };
  }

  if (nature === "benefic") {
    return weak
      ? { approach: "strengthen", rationale: `${gName} rules an angle or a trine from your lagna — a genuinely helpful significator here — but is currently weak. Strengthening remedies are appropriate.` }
      : { approach: "maintain", rationale: `${gName} rules an angle or a trine from your lagna and is already well placed. Light maintenance — favourable colors, occasional charity, respect for its deity — is enough.` };
  }

  if (nature === "mixed") {
    return {
      approach: "balance",
      rationale: `${gName} rules both a supportive house and a difficult one from your lagna, so it acts as a mixed significator. The balanced approach below supports its better side without over-stimulating the harder one.`,
    };
  }

  if (nature === "maraka") {
    return {
      approach: "balance",
      rationale: `${gName} rules only the 2nd and/or 7th house (the classical maraka houses) from your lagna. It is not read as strongly good or strongly harmful on its own — a measured, general practice is enough unless it is also badly afflicted.`,
    };
  }

  return {
    approach: "balance",
    rationale: `${gName} does not rule an angle, a trine or a dusthana from your lagna. A general, moderate practice is enough here.`,
  };
}

const APPROACH_LABEL = Object.freeze({
  strengthen: "Strengthen", maintain: "Maintain & channel", balance: "Balance", pacify: "Pacify",
});

/* ---------------------------------------------------------------- priority score ---------------------------------------------------------------- */

function priorityScore({ nature, dignity, house, retrograde, isLagnaLord }) {
  let score = 0;
  if (WEAK_DIGNITIES.includes(dignity)) score += 2;
  if (STRONG_DIGNITIES.includes(dignity)) score -= 1;
  if (DUSTHANA.includes(house)) score += 1;
  if (retrograde && nature !== "shadow") score += 1;
  if (nature === "malefic" || nature === "shadow") score += 1;
  if (nature === "yogakaraka") score -= 1;
  if (isLagnaLord) score += 1;
  return score;
}

/* ---------------------------------------------------------------- composer ---------------------------------------------------------------- */

/**
 * Build the full remedy plan for a kundali: every graha's functional
 * nature, dignity, recommended approach and remedy content, sorted by how
 * much attention each one classically calls for, plus a dedicated section
 * for the currently running mahadasha and antardasha.
 */
export function buildRemedyPlan(kundali) {
  const lordship = houseLordshipMap(kundali);

  const grahaPlans = kundali.grahas.order.map((key) => {
    const g = kundali.grahas[key];
    const housesRuled = lordship[key] || [];
    const { nature, isLagnaLord } = functionalNature(key, housesRuled);
    const dignity = dignityOf(key, g.rashi.key);
    const { approach, rationale } = approachFor({
      grahaKey: key, nature, dignity, house: g.house, retrograde: g.retrograde, isLagnaLord,
    });
    const score = priorityScore({ nature, dignity, house: g.house, retrograde: g.retrograde, isLagnaLord });

    return {
      key,
      name: GRAHA_PROFILES[key].name,
      english: GRAHA_PROFILES[key].english,
      house: g.house,
      rashi: g.rashi,
      dignity,
      dignityLabel: DIGNITY_LABEL[dignity],
      retrograde: g.retrograde,
      nature,
      natureLabel: NATURE_LABEL[nature],
      housesRuled,
      isLagnaLord,
      approach,
      approachLabel: APPROACH_LABEL[approach],
      rationale,
      score,
      profile: REMEDY_PROFILES[key],
    };
  });

  const sorted = [...grahaPlans].sort((a, b) => b.score - a.score);

  let dashaPlan = null;
  try {
    const result = vimshottariMahadashas(kundali.dateUTC, kundali.grahas.chandra.longitude);
    const running = currentDasha(result, new Date());
    if (running) {
      const mahaPlan = grahaPlans.find((p) => matchesLord(p.key, running.maha.lord));
      const antarPlan = running.antar ? grahaPlans.find((p) => matchesLord(p.key, running.antar.lord)) : null;
      dashaPlan = { mahaLord: running.maha.lord, antarLord: running.antar?.lord || null, mahaPlan, antarPlan };
    }
  } catch (e) {
    dashaPlan = null;
  }

  return { lagna: kundali.ascendant, grahaPlans: sorted, dashaPlan };
}

function matchesLord(grahaKey, dashaLordName) {
  return GRAHA_PROFILES[grahaKey].name === dashaLordName;
}
