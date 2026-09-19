/**
 * JyotishVeda — Ashtakoota Guna Milan (36-point kundali matching).
 *
 *   Varna 1 · Vashya 2 · Tara 3 · Yoni 4 · Graha Maitri 5 · Gana 6 · Bhakoot 7 · Nadi 8
 *
 * Every table used here is printed on the site so a reader can check the
 * arithmetic. Where classical sources disagree, the simplification is stated
 * in the `note` field returned with that koota.
 */
import { RASHIS, rashiByKey, countFrom } from "./rashi.js";
import { NAKSHATRAS, nakshatraByNumber } from "./nakshatra.js";

/* ---------- 1. Varna (1 point) ---------- */

const VARNA_RANK = { Brahmin: 4, Kshatriya: 3, Vaishya: 2, Shudra: 1 };

function varnaKoota(boyRashi, girlRashi) {
  const b = VARNA_RANK[boyRashi.varna];
  const g = VARNA_RANK[girlRashi.varna];
  const score = b >= g ? 1 : 0;
  return {
    name: "Varna",
    max: 1,
    score,
    detail: `${boyRashi.varna} (boy) vs ${girlRashi.varna} (girl)`,
    note: "One point when the boy's varna is equal to or above the girl's varna.",
  };
}

/* ---------- 2. Vashya (2 points) ---------- */

const VASHYA_GROUP = {
  mesha: "Chatushpada", vrishabha: "Chatushpada", mithuna: "Manav",
  karka: "Jalachara", simha: "Vanchara", kanya: "Manav",
  tula: "Manav", vrishchika: "Keeta", dhanu: "Manav",
  makara: "Chatushpada", kumbha: "Manav", meena: "Jalachara",
};

const VASHYA_ORDER = ["Chatushpada", "Manav", "Jalachara", "Vanchara", "Keeta"];
const VASHYA_MATRIX = [
  //          Chat  Manav Jala  Vanch Keeta
  /* Chat  */ [2,   1,    2,    0,    1],
  /* Manav */ [1,   2,    1,    0.5,  1],
  /* Jala  */ [2,   1,    2,    1,    1],
  /* Vanch */ [0,   1,    1,    2,    1],
  /* Keeta */ [1,   1,    0.5,  1,    2],
];

function vashyaKoota(boyRashi, girlRashi) {
  const bg = VASHYA_GROUP[boyRashi.key];
  const gg = VASHYA_GROUP[girlRashi.key];
  const score = VASHYA_MATRIX[VASHYA_ORDER.indexOf(bg)][VASHYA_ORDER.indexOf(gg)];
  return {
    name: "Vashya",
    max: 2,
    score,
    detail: `${bg} (boy) vs ${gg} (girl)`,
    note: "Dhanu and Makara are split across two groups in classical texts; this site assigns each rashi to a single group.",
  };
}

/* ---------- 3. Tara (3 points) ---------- */

function taraCount(fromNumber, toNumber) {
  return ((toNumber - fromNumber + 27) % 27) + 1;
}

function taraAuspicious(count) {
  const r = count % 9;
  return !(r === 3 || r === 5 || r === 7);
}

function taraKoota(boyNak, girlNak) {
  const fromGirl = taraCount(girlNak.number, boyNak.number);
  const fromBoy = taraCount(boyNak.number, girlNak.number);
  const a = taraAuspicious(fromGirl);
  const b = taraAuspicious(fromBoy);
  const score = a && b ? 3 : a || b ? 1.5 : 0;
  return {
    name: "Tara",
    max: 3,
    score,
    detail: `Count girl→boy ${fromGirl} (remainder ${fromGirl % 9}), boy→girl ${fromBoy} (remainder ${fromBoy % 9})`,
    note: "Remainders 3, 5 and 7 are the inauspicious taras — Vipat, Pratyari and Vadha.",
  };
}

/* ---------- 4. Yoni (4 points) ---------- */

const SWORN_ENEMIES = [
  ["Cow", "Tiger"], ["Elephant", "Lion"], ["Horse", "Buffalo"],
  ["Dog", "Deer"], ["Serpent", "Mongoose"], ["Monkey", "Sheep"],
  ["Cat", "Rat"],
];

const GENTLE_YONIS = ["Cow", "Elephant", "Sheep", "Deer", "Horse", "Monkey", "Mongoose", "Rat", "Cat"];

function yoniKoota(boyNak, girlNak) {
  const a = boyNak.yoni;
  const b = girlNak.yoni;
  let score;
  let reason;

  if (a === b) {
    score = 4;
    reason = "identical yoni";
  } else if (SWORN_ENEMIES.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) {
    score = 0;
    reason = "sworn-enemy pair (maha vaira)";
  } else if (GENTLE_YONIS.includes(a) === GENTLE_YONIS.includes(b)) {
    score = 3;
    reason = "same temperament class";
  } else {
    score = 2;
    reason = "mixed temperament";
  }

  return {
    name: "Yoni",
    max: 4,
    score,
    detail: `${a} (${boyNak.yoniGender}) vs ${b} (${girlNak.yoniGender}) — ${reason}`,
    note: "Classical texts use a full 14×14 yoni table; this site uses a documented simplification with the seven sworn-enemy pairs preserved.",
  };
}

/* ---------- 5. Graha Maitri (5 points) ---------- */

const RELATIONS = {
  Surya:   { friends: ["Chandra", "Mangal", "Guru"], enemies: ["Shukra", "Shani"] },
  Chandra: { friends: ["Surya", "Budha"], enemies: [] },
  Mangal:  { friends: ["Surya", "Chandra", "Guru"], enemies: ["Budha"] },
  Budha:   { friends: ["Surya", "Shukra"], enemies: ["Chandra"] },
  Guru:    { friends: ["Surya", "Chandra", "Mangal"], enemies: ["Budha", "Shukra"] },
  Shukra:  { friends: ["Budha", "Shani"], enemies: ["Surya", "Chandra"] },
  Shani:   { friends: ["Budha", "Shukra"], enemies: ["Surya", "Chandra", "Mangal"] },
};

function relationOf(a, b) {
  const r = RELATIONS[a];
  if (!r) return "neutral";
  if (r.friends.includes(b)) return "friend";
  if (r.enemies.includes(b)) return "enemy";
  return "neutral";
}

function maitriKoota(boyRashi, girlRashi) {
  const bl = boyRashi.lord;
  const gl = girlRashi.lord;
  if (bl === gl) {
    return { name: "Graha Maitri", max: 5, score: 5, detail: `Both rashis ruled by ${bl}`, note: "Identical lords score the full five points." };
  }
  const r1 = relationOf(bl, gl);
  const r2 = relationOf(gl, bl);
  const set = [r1, r2].sort().join("-");
  const table = {
    "friend-friend": 5,
    "friend-neutral": 4,
    "neutral-neutral": 3,
    "enemy-friend": 1,
    "enemy-neutral": 0.5,
    "enemy-enemy": 0,
  };
  return {
    name: "Graha Maitri",
    max: 5,
    score: table[set] ?? 0,
    detail: `${bl} → ${gl} is ${r1}; ${gl} → ${bl} is ${r2}`,
    note: "Based on the Parashari table of natural planetary friendship.",
  };
}

/* ---------- 6. Gana (6 points) ---------- */

const GANA_MATRIX = {
  Deva:     { Deva: 6, Manushya: 5, Rakshasa: 1 },
  Manushya: { Deva: 6, Manushya: 6, Rakshasa: 0 },
  Rakshasa: { Deva: 0, Manushya: 0, Rakshasa: 6 },
};

function ganaKoota(boyNak, girlNak) {
  const score = GANA_MATRIX[boyNak.gana][girlNak.gana];
  return {
    name: "Gana",
    max: 6,
    score,
    detail: `${boyNak.gana} (boy) vs ${girlNak.gana} (girl)`,
    note: "The table is asymmetric: a Rakshasa-gana boy with a Deva or Manushya girl scores zero.",
  };
}

/* ---------- 7. Bhakoot (7 points) ---------- */

function bhakootKoota(boyRashi, girlRashi) {
  const d1 = countFrom(boyRashi.index, girlRashi.index);
  const d2 = countFrom(girlRashi.index, boyRashi.index);
  const pair = [d1, d2].sort((x, y) => x - y).join("/");
  const blocked = ["2/12", "5/9", "6/8"];
  const score = blocked.includes(pair) ? 0 : 7;
  return {
    name: "Bhakoot",
    max: 7,
    score,
    detail: `Rashi distance ${d1} and ${d2} (${pair})`,
    note: "The 2/12, 5/9 and 6/8 axes are the three bhakoot doshas and score zero.",
  };
}

/* ---------- 8. Nadi (8 points) ---------- */

function nadiKoota(boyNak, girlNak) {
  const same = boyNak.nadi === girlNak.nadi;
  return {
    name: "Nadi",
    max: 8,
    score: same ? 0 : 8,
    detail: `${boyNak.nadi} (boy) vs ${girlNak.nadi} (girl)`,
    note: "Identical nadi is the classical nadi dosha; several exemptions exist and are described on the tool page.",
  };
}

/* ---------- assembly ---------- */

/**
 * @param {{rashi:string, nakshatra:number}} boy
 * @param {{rashi:string, nakshatra:number}} girl
 */
export function gunaMilan(boy, girl) {
  const boyRashi = rashiByKey(boy.rashi);
  const girlRashi = rashiByKey(girl.rashi);
  const boyNak = nakshatraByNumber(boy.nakshatra);
  const girlNak = nakshatraByNumber(girl.nakshatra);

  if (!boyRashi || !girlRashi || !boyNak || !girlNak) {
    throw new RangeError("Both a rashi and a nakshatra are required for each person.");
  }

  const kootas = [
    varnaKoota(boyRashi, girlRashi),
    vashyaKoota(boyRashi, girlRashi),
    taraKoota(boyNak, girlNak),
    yoniKoota(boyNak, girlNak),
    maitriKoota(boyRashi, girlRashi),
    ganaKoota(boyNak, girlNak),
    bhakootKoota(boyRashi, girlRashi),
    nadiKoota(boyNak, girlNak),
  ];

  const total = kootas.reduce((sum, k) => sum + k.score, 0);

  let verdict;
  if (total >= 28) verdict = "Excellent match by the classical scale";
  else if (total >= 24) verdict = "Very good match";
  else if (total >= 18) verdict = "Acceptable match — the usual minimum";
  else if (total >= 12) verdict = "Below the usual threshold";
  else verdict = "Poor score on the Ashtakoota scale";

  const flags = [];
  if (kootas[7].score === 0) flags.push("Nadi dosha");
  if (kootas[6].score === 0) flags.push("Bhakoot dosha");
  if (kootas[5].score === 0) flags.push("Gana dosha");

  return {
    boy: { rashi: boyRashi, nakshatra: boyNak },
    girl: { rashi: girlRashi, nakshatra: girlNak },
    kootas,
    total,
    max: 36,
    percent: Math.round((total / 36) * 100),
    verdict,
    flags,
  };
}

export { RASHIS, NAKSHATRAS };

