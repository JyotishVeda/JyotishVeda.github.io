/**
 * VedicJyoti / JyotishVeda — graha placement interpretation engine.
 *
 * This module does not store 108 hand-written essays. It composes a reading
 * from small, reusable, hand-authored pieces — the same "show the working"
 * approach used everywhere else on this site:
 *
 *   sign reading   = graha's element-phrase + graha's mode-phrase
 *   house reading  = graha's verb-phrase + the house's own theme + a
 *                    benefic/malefic-aware note for that house's classification
 *   dignity reading = one of six generic templates, filled with the actual
 *                    graha / rashi / lord names for this chart
 *   retrograde     = one generic template, filled with the graha's name
 *   nakshatra      = one generic template blending karaka with the deity
 *
 * Every sentence is specific to the instance because the templates are filled
 * with real data from the chart, not shown as generic boilerplate.
 */

/* ---------------------------------------------------------------- meta ---------------------------------------------------------------- */

export const GRAHA_PROFILES = Object.freeze({
  surya: {
    name: "Surya", english: "Sun", karaka: "the soul, authority, father and vitality",
    nature: "malefic", verb: "asserts authority, visibility and the will to be recognised",
    element: {
      Agni: "Here it acts on its own natural ground — fire meeting fire — so its need to be seen and to lead comes through directly and without much restraint.",
      Prithvi: "Placed in an earth sign, its drive for recognition is channelled into something durable and material rather than into pure display.",
      Vayu: "In an air sign its authority expresses through ideas, argument and social standing rather than through raw command.",
      Jala: "In a water sign the Sun's usual confidence is filtered through feeling, which can make authority here more private, more easily wounded, and more protective of what it leads.",
    },
    mode: {
      Chara: "The movable quality adds restlessness to Surya's need for recognition — status is pursued actively rather than waited for.",
      Sthira: "The fixed quality gives Surya's authority staying power; position, once established here, is held onto firmly.",
      Dwisvabhava: "The dual quality splits Surya's attention, so authority tends to be exercised across more than one role or audience at once.",
    },
  },
  chandra: {
    name: "Chandra", english: "Moon", karaka: "the mind, mother, emotional habits and public standing",
    nature: "benefic", verb: "colours the emotional tone, memory and instinctive habits of daily life",
    element: {
      Agni: "In a fire sign the mind runs warm and quick to react — moods rise fast and pass fairly fast too.",
      Prithvi: "In an earth sign the emotional nature is steadier and more practical, seeking comfort in routine and material security.",
      Vayu: "In an air sign the mind processes feeling through talk and social contact rather than through solitary reflection.",
      Jala: "In a water sign — its own natural element — the Moon is unusually sensitive, retentive and quick to absorb the emotional weather around it.",
    },
    mode: {
      Chara: "The movable quality keeps the emotional life in motion, changing with circumstance rather than settling.",
      Sthira: "The fixed quality gives the emotional nature unusual constancy, for better and for worse — moods, once formed, are slow to shift.",
      Dwisvabhava: "The dual quality makes the emotional nature adaptable and a little inconsistent, responsive to whoever is in the room.",
    },
  },
  mangal: {
    name: "Mangal", english: "Mars", karaka: "courage, siblings, land, energy and the capacity for conflict",
    nature: "malefic", verb: "injects drive, assertiveness and a readiness to act without waiting",
    element: {
      Agni: "In a fire sign — home ground for Mars — energy is direct, fast and unmistakably visible; patience is not this placement's strength.",
      Prithvi: "In an earth sign Mars channels its force into sustained, practical effort rather than sudden bursts.",
      Vayu: "In an air sign Mars fights with words and strategy more readily than with force, and restlessness shows up mentally rather than physically.",
      Jala: "In a water sign Mars's usual bluntness is complicated by feeling, which can turn direct aggression into something more indirect, brooding or defensive.",
    },
    mode: {
      Chara: "The movable quality suits Mars well — it is a graha built for starting things, and a movable sign lets it do exactly that.",
      Sthira: "The fixed quality holds Mars's energy in one place for a long time, building toward outbursts rather than releasing steadily.",
      Dwisvabhava: "The dual quality scatters Mars's energy across more than one front, so drive shows up in bursts across different pursuits.",
    },
  },
  budha: {
    name: "Budha", english: "Mercury", karaka: "intellect, speech, trade, calculation and adaptability",
    nature: "benefic", verb: "brings analysis, communication and a need to understand and explain",
    element: {
      Agni: "In a fire sign the intellect is quick, opinionated and eager to argue a position.",
      Prithvi: "In an earth sign — a natural home for Mercury — thinking becomes practical, detail-oriented and commercially minded.",
      Vayu: "In an air sign Mercury runs at its most fluent: ideas move fast, conversation comes easily, and interests scatter across many subjects.",
      Jala: "In a water sign the usually detached Mercury is coloured by feeling, producing an intuitive rather than purely logical style of thought.",
    },
    mode: {
      Chara: "The movable quality keeps the mind restless, moving from topic to topic and place to place.",
      Sthira: "The fixed quality gives Mercury unusual staying power — once a subject is taken up, it is studied thoroughly rather than skimmed.",
      Dwisvabhava: "The dual quality suits Mercury naturally, supporting its native adaptability and its ease with more than one subject or role at once.",
    },
  },
  guru: {
    name: "Guru", english: "Jupiter", karaka: "wisdom, teachers, children, wealth and dharma",
    nature: "benefic", verb: "brings growth, opportunity, ethical concern and a wish to teach or be guided",
    element: {
      Agni: "In a fire sign Jupiter's optimism is enthusiastic and expansive, sometimes to the point of overreach.",
      Prithvi: "In an earth sign Jupiter's growth is slower but more durable, expressed through material and institutional expansion rather than pure belief.",
      Vayu: "In an air sign Jupiter favours ideas, philosophy and social principle over any single dogma.",
      Jala: "In a water sign — where it is exalted — Jupiter's wisdom becomes deeply intuitive and compassionate, its natural generosity at its most complete.",
    },
    mode: {
      Chara: "The movable quality sends Jupiter's growth outward, toward travel, new ground and continual expansion.",
      Sthira: "The fixed quality settles Jupiter's wisdom into something taught and held rather than constantly sought anew.",
      Dwisvabhava: "The dual quality suits Jupiter naturally, supporting its role as teacher and its comfort moving between belief systems and subjects.",
    },
  },
  shukra: {
    name: "Shukra", english: "Venus", karaka: "spouse, pleasure, art, vehicles and comfort",
    nature: "benefic", verb: "brings a wish for comfort, harmony, beauty and attachment",
    element: {
      Agni: "In a fire sign Venus's affection is passionate and quickly expressed, though not always the most patient in its attachments.",
      Prithvi: "In an earth sign Venus finds pleasure in material comfort, sensation and reliable, well-built relationships.",
      Vayu: "In an air sign — a natural home for Venus — love is social, intellectual and expressed through exchange, charm and negotiation.",
      Jala: "In a water sign — where it is exalted — Venus's capacity for devotion and emotional depth in relationship is at its most complete.",
    },
    mode: {
      Chara: "The movable quality keeps Venus's affections restless, drawn to new romantic or aesthetic ground.",
      Sthira: "The fixed quality gives Venus's attachments real staying power — loyalty runs deep, and so can possessiveness.",
      Dwisvabhava: "The dual quality makes Venus adaptable in relationship, comfortable moving between roles, tastes or partners.",
    },
  },
  shani: {
    name: "Shani", english: "Saturn", karaka: "longevity, discipline, labour, delay and the poor and elderly",
    nature: "malefic", verb: "brings structure, patience, delay and the discipline of limits",
    element: {
      Agni: "In a fire sign Saturn's usual caution sits uneasily against fire's urge to act, often producing frustration before it produces discipline.",
      Prithvi: "In an earth sign Saturn is comfortable and productive, building slowly toward something that lasts.",
      Vayu: "In an air sign — where it is exalted — Saturn's discipline becomes structural and systemic, at ease with rules, institutions and long-view thinking.",
      Jala: "In a water sign Saturn's coldness meets feeling directly, often producing emotional reserve or a guardedness that takes a long time to lower.",
    },
    mode: {
      Chara: "The movable quality is uncomfortable for slow-moving Saturn, forcing patience onto a house of action.",
      Sthira: "The fixed quality suits Saturn naturally — endurance is exactly what a fixed sign rewards.",
      Dwisvabhava: "The dual quality asks Saturn to hold discipline across more than one front at once, which it does slowly and with effort.",
    },
  },
  rahu: {
    name: "Rahu", english: "North Node", karaka: "obsession, foreign things, technology and unconventional ambition",
    nature: "shadow malefic", verb: "amplifies whatever it touches and pulls attention toward the unfamiliar",
    element: {
      Agni: "In a fire sign Rahu's amplification becomes bold, attention-seeking ambition that rarely waits its turn.",
      Prithvi: "In an earth sign Rahu channels its craving into material accumulation and status through possessions.",
      Vayu: "In an air sign Rahu amplifies ideas, networks and unconventional thinking, often years ahead of its time or badly overreaching.",
      Jala: "In a water sign Rahu's craving becomes emotional or psychological, producing intense, sometimes obsessive attachments.",
    },
    mode: {
      Chara: "The movable quality feeds Rahu's restlessness — new ground is chased continually, rarely settled into.",
      Sthira: "The fixed quality lets Rahu's obsessions take hold and stay for a long time once formed.",
      Dwisvabhava: "The dual quality scatters Rahu's craving across more than one target rather than fixing it on one.",
    },
  },
  ketu: {
    name: "Ketu", english: "South Node", karaka: "detachment, moksha, inherited skill and sudden loss",
    nature: "shadow malefic", verb: "quietly detaches interest and empties out familiar patterns",
    element: {
      Agni: "In a fire sign Ketu's detachment shows up as sudden loss of enthusiasm for things that once mattered a great deal.",
      Prithvi: "In an earth sign Ketu unsettles material security, producing indifference to possessions or status others chase hard.",
      Vayu: "In an air sign Ketu detaches from social convention and popular opinion, often producing an unusual, self-sufficient way of thinking.",
      Jala: "In a water sign Ketu withdraws from ordinary emotional attachment, which can look like detachment or like unusual spiritual sensitivity.",
    },
    mode: {
      Chara: "The movable quality keeps Ketu's detachment on the move, letting go of one thing after another rather than resting anywhere.",
      Sthira: "The fixed quality is unusual for Ketu — the detachment holds firmly here, rather than passing quickly.",
      Dwisvabhava: "The dual quality spreads Ketu's release across more than one area of life at once.",
    },
  },
});

/** Own sign(s), exaltation and debilitation, keyed to rashi keys used by rashi.js. */
export const GRAHA_DIGNITY = Object.freeze({
  surya:   { own: ["simha"], moolatrikona: "simha", exalted: "mesha", debilitated: "tula" },
  chandra: { own: ["karka"], moolatrikona: "vrishabha", exalted: "vrishabha", debilitated: "vrishchika" },
  mangal:  { own: ["mesha", "vrishchika"], moolatrikona: "mesha", exalted: "makara", debilitated: "karka" },
  budha:   { own: ["mithuna", "kanya"], moolatrikona: "kanya", exalted: "kanya", debilitated: "meena" },
  guru:    { own: ["dhanu", "meena"], moolatrikona: "dhanu", exalted: "karka", debilitated: "makara" },
  shukra:  { own: ["vrishabha", "tula"], moolatrikona: "tula", exalted: "meena", debilitated: "kanya" },
  shani:   { own: ["makara", "kumbha"], moolatrikona: "kumbha", exalted: "tula", debilitated: "mesha" },
  rahu:    { own: [], moolatrikona: null, exalted: "vrishabha", debilitated: "vrishchika" },
  ketu:    { own: [], moolatrikona: null, exalted: "vrishchika", debilitated: "vrishabha" },
});

/** Natural friendship table for the seven classical grahas (Parashari). */
export const RELATIONS = Object.freeze({
  surya:   { friends: ["chandra", "mangal", "guru"], enemies: ["shukra", "shani"] },
  chandra: { friends: ["surya", "budha"], enemies: [] },
  mangal:  { friends: ["surya", "chandra", "guru"], enemies: ["budha"] },
  budha:   { friends: ["surya", "shukra"], enemies: ["chandra"] },
  guru:    { friends: ["surya", "chandra", "mangal"], enemies: ["budha", "shukra"] },
  shukra:  { friends: ["budha", "shani"], enemies: ["surya", "chandra"] },
  shani:   { friends: ["budha", "shukra"], enemies: ["surya", "chandra", "mangal"] },
});

/** rashi key -> graha key of its lord. */
export const RASHI_LORD_KEY = Object.freeze({
  mesha: "mangal", vrishabha: "shukra", mithuna: "budha", karka: "chandra",
  simha: "surya", kanya: "budha", tula: "shukra", vrishchika: "mangal",
  dhanu: "guru", makara: "shani", kumbha: "shani", meena: "guru",
});

/** Short name every 12 bhavas, plus a compact theme phrase (mirrors data/bhavas.yaml). */
export const BHAVA_INFO = Object.freeze([
  null,
  { name: "Tanu Bhava", theme: "the body, appearance, temperament and how you come across to others" },
  { name: "Dhana Bhava", theme: "accumulated wealth, family of origin, speech and personal values" },
  { name: "Sahaja Bhava", theme: "siblings, courage, short travel and hands-on effort" },
  { name: "Sukha Bhava", theme: "mother, home, land, vehicles and inner contentment" },
  { name: "Putra Bhava", theme: "children, intelligence, creativity and speculative gain" },
  { name: "Ripu Bhava", theme: "illness, debt, competition, daily work and service" },
  { name: "Yuvati Bhava", theme: "marriage, business partnership, contracts and open opponents" },
  { name: "Randhra Bhava", theme: "longevity, inheritance, joint finances and sudden or hidden events" },
  { name: "Dharma Bhava", theme: "father, guru, fortune, higher learning and long journeys" },
  { name: "Karma Bhava", theme: "profession, public status, authority and visible achievement" },
  { name: "Labha Bhava", theme: "income, gains, elder siblings, friends and fulfilled desires" },
  { name: "Vyaya Bhava", theme: "expenditure, foreign residence, sleep, seclusion and liberation" },
]);

/** House classification used only to select the right benefic/malefic-aware note. */
const HOUSE_CLASS = Object.freeze({
  1: ["kendra", "trikona"], 2: ["panapara"], 3: ["upachaya"], 4: ["kendra"],
  5: ["trikona"], 6: ["upachaya", "dusthana"], 7: ["kendra"], 8: ["dusthana"],
  9: ["trikona"], 10: ["kendra", "upachaya"], 11: ["upachaya"], 12: ["dusthana"],
});

const CLASS_NOTE = Object.freeze({
  kendra: {
    benefic: "A kendra (angular house) gives a natural benefic real, visible strength — it directly shapes one of the four pillars of the chart.",
    malefic: "A natural malefic in a kendra loses some of its harmful edge here — angular houses are said to moderate a malefic's difficulty even as they hand it real influence.",
  },
  trikona: {
    benefic: "A trikona (trinal house) is one of the most fortunate placements available, and a natural benefic here tends to deliver its significations through good fortune and support rather than effort.",
    malefic: "Even a natural malefic tends to give supportive, if slightly complicated, results from a trikona — the house's own auspiciousness carries through.",
  },
  upachaya: {
    benefic: "An upachaya (growing) house means results connected to this graha tend to build up over time rather than arrive early.",
    malefic: "Upachaya houses are classically read as good ground for a natural malefic — struggle here tends to convert into capability rather than remaining pure difficulty.",
  },
  dusthana: {
    benefic: "Even a natural benefic is somewhat constrained in a dusthana, though its presence usually softens the house's harder themes rather than intensifying them.",
    malefic: "A natural malefic in a dusthana is a classically difficult placement, often tied to loss, illness or crisis in the affairs of this house — though the same placement can support research, healing, or work done away from public view.",
  },
  panapara: {
    benefic: "A panapara (succedent) house is a resource-and-sustenance house; a benefic here mainly supports what the angles have already begun.",
    malefic: "A panapara house gives a natural malefic a comparatively mild stage — friction here shows up around resources and sustained effort rather than crisis.",
  },
});

function benMal(grahaKey) {
  const nature = GRAHA_PROFILES[grahaKey].nature;
  return nature === "benefic" ? "benefic" : "malefic";
}

/* ---------------------------------------------------------------- dignity ---------------------------------------------------------------- */

export function dignityOf(grahaKey, rashiKey) {
  const d = GRAHA_DIGNITY[grahaKey];
  if (d.moolatrikona === rashiKey) return "moolatrikona";
  if (d.own.includes(rashiKey)) return "own";
  if (d.exalted === rashiKey) return "exalted";
  if (d.debilitated === rashiKey) return "debilitated";
  const lordKey = RASHI_LORD_KEY[rashiKey];
  const rel = RELATIONS[grahaKey];
  if (!rel || !lordKey || lordKey === grahaKey) return "neutral";
  if (rel.friends.includes(lordKey)) return "friend";
  if (rel.enemies.includes(lordKey)) return "enemy";
  return "neutral";
}

export const DIGNITY_LABEL = Object.freeze({
  own: "Own sign", moolatrikona: "Moolatrikona", exalted: "Exalted",
  debilitated: "Debilitated", friend: "Friendly sign", enemy: "Enemy sign", neutral: "Neutral sign",
});

function dignityParagraph(grahaKey, rashiName, lordName, dignity) {
  const g = GRAHA_PROFILES[grahaKey].name;
  switch (dignity) {
    case "own":
      return `${g} is in its own sign here, which means it operates with full natural authority and needs little external support to deliver ${GRAHA_PROFILES[grahaKey].karaka.split(",")[0]}.`;
    case "moolatrikona":
      return `${g} occupies its moolatrikona sign, one of its strongest possible placements — close to exaltation in strength, and more stable over time.`;
    case "exalted":
      return `${g} is exalted in ${rashiName}, its single strongest placement. Results connected to it tend to express confidently and with ease — though an exalted graha that is also badly aspected can overreach or overpromise.`;
    case "debilitated":
      return `${g} is debilitated in ${rashiName}, its weakest placement. Results connected to it tend to arrive with self-doubt, delay or extra effort — though a strong dispositor, a benefic aspect, or a classical Neecha Bhanga (debilitation-cancelling combination) can substantially soften this.`;
    case "friend":
      return `${rashiName} is ruled by ${lordName}, a natural friend of ${g}, so ${g} generally feels at ease here even without owning the sign outright.`;
    case "enemy":
      return `${rashiName} is ruled by ${lordName}, a natural enemy of ${g}, which classically introduces some friction into how ${g}'s significations play out in this part of the chart.`;
    default:
      return `${rashiName} is ruled by ${lordName}, who is neither a natural friend nor enemy of ${g} — this rulership neither particularly supports nor particularly strains the placement.`;
  }
}

/* ---------------------------------------------------------------- composer ---------------------------------------------------------------- */

/**
 * Build a full, human-readable interpretation of one graha's placement in a kundali.
 * @param {object} kundali  output of buildKundali()
 * @param {string} grahaKey e.g. "mangal"
 */
export function interpretGrahaPlacement(kundali, grahaKey) {
  const g = kundali.grahas[grahaKey];
  if (!g) throw new RangeError(`Unknown graha: ${grahaKey}`);

  const profile = GRAHA_PROFILES[grahaKey];
  const rashi = g.rashi;
  const houseNum = g.house;
  const bhava = BHAVA_INFO[houseNum];
  const dignity = dignityOf(grahaKey, rashi.key);
  const lordKey = RASHI_LORD_KEY[rashi.key];
  const lordName = lordKey ? GRAHA_PROFILES[lordKey].name : rashi.lord;

  const elementKey = rashi.tattva.split(" ")[0]; // "Agni (Fire)" -> "Agni"
  const modeKey = rashi.swabhava.split(" ")[0];  // "Chara (Movable)" -> "Chara"

  const signParagraph =
    `${profile.name} occupies ${rashi.name} (${rashi.english}), a ${rashi.swabhava.toLowerCase()} ` +
    `${rashi.tattva.toLowerCase()} sign. ${profile.element[elementKey]} ${profile.mode[modeKey]}`;

  const classes = HOUSE_CLASS[houseNum] || [];
  const natureKey = benMal(grahaKey);
  const classNotes = classes.map((c) => CLASS_NOTE[c][natureKey]).join(" ");

  const houseParagraph =
    `Placed in your ${houseNum}${ordinalSuffix(houseNum)} house — ${bhava.name}, the house of ${bhava.theme} — ` +
    `${profile.name} ${profile.verb}, applied specifically to ${bhava.theme}. ${classNotes}`;

  const dignityParagraphText = dignityParagraph(grahaKey, rashi.name, lordName, dignity);

  const retroParagraph = g.retrograde
    ? (grahaKey === "rahu" || grahaKey === "ketu"
        ? `${profile.name} is always retrograde — this is its natural motion, not a special condition, so no separate retrograde effect is read for the nodes.`
        : `${profile.name} is retrograde (vakri) here. Classical texts describe a retrograde graha's significations as turned inward: results connected to it often arrive later than expected, or only after revisiting unfinished matters — though many traditions hold that a retrograde graha eventually delivers its results with extra strength once it does.`)
    : null;

  const nakshatraParagraph =
    `${profile.name} sits in ${g.nakshatra.name} nakshatra (pada ${g.nakshatra.pada}), ruled by ${g.nakshatra.lord} ` +
    `and presided over by ${g.nakshatra.deity} — a secondary layer that blends ${profile.karaka.split(",")[0]} with the themes of ${g.nakshatra.deity}.`;

  const paragraphs = [signParagraph, houseParagraph, dignityParagraphText];
  if (retroParagraph) paragraphs.push(retroParagraph);
  paragraphs.push(nakshatraParagraph);

  return {
    key: grahaKey,
    name: profile.name,
    english: profile.english,
    karaka: profile.karaka,
    house: houseNum,
    bhavaName: bhava.name,
    rashi,
    dignity,
    dignityLabel: DIGNITY_LABEL[dignity],
    retrograde: g.retrograde,
    nakshatra: g.nakshatra,
    longitude: g.longitude,
    paragraphs,
  };
}

function ordinalSuffix(n) {
  if (n >= 11 && n <= 13) return "th";
  switch (n % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}
