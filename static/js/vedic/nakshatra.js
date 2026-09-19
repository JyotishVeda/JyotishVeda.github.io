/**
 * JyotishVeda — Nakshatra and pada mapping.
 * 360° ÷ 27 = 13°20′ per nakshatra; each nakshatra ÷ 4 = 3°20′ per pada.
 */
import { normalizeDegrees } from "./ayanamsha.js";

export const NAKSHATRA_SPAN = 360 / 27;
export const PADA_SPAN = NAKSHATRA_SPAN / 4;

export const NAKSHATRAS = Object.freeze([
  { number: 1,  key: "ashwini",           name: "Ashwini",           lord: "Ketu",    gana: "Deva",     yoni: "Horse",    yoniGender: "M", nadi: "Adi",    deity: "Ashwini Kumaras" },
  { number: 2,  key: "bharani",           name: "Bharani",           lord: "Shukra",  gana: "Manushya", yoni: "Elephant", yoniGender: "M", nadi: "Madhya", deity: "Yama" },
  { number: 3,  key: "krittika",          name: "Krittika",          lord: "Surya",   gana: "Rakshasa", yoni: "Sheep",    yoniGender: "F", nadi: "Antya",  deity: "Agni" },
  { number: 4,  key: "rohini",            name: "Rohini",            lord: "Chandra", gana: "Manushya", yoni: "Serpent",  yoniGender: "M", nadi: "Antya",  deity: "Brahma" },
  { number: 5,  key: "mrigashira",        name: "Mrigashira",        lord: "Mangal",  gana: "Deva",     yoni: "Serpent",  yoniGender: "F", nadi: "Madhya", deity: "Soma" },
  { number: 6,  key: "ardra",             name: "Ardra",             lord: "Rahu",    gana: "Manushya", yoni: "Dog",      yoniGender: "F", nadi: "Adi",    deity: "Rudra" },
  { number: 7,  key: "punarvasu",         name: "Punarvasu",         lord: "Guru",    gana: "Deva",     yoni: "Cat",      yoniGender: "F", nadi: "Adi",    deity: "Aditi" },
  { number: 8,  key: "pushya",            name: "Pushya",            lord: "Shani",   gana: "Deva",     yoni: "Sheep",    yoniGender: "M", nadi: "Madhya", deity: "Brihaspati" },
  { number: 9,  key: "ashlesha",          name: "Ashlesha",          lord: "Budha",   gana: "Rakshasa", yoni: "Cat",      yoniGender: "M", nadi: "Antya",  deity: "Nagas" },
  { number: 10, key: "magha",             name: "Magha",             lord: "Ketu",    gana: "Rakshasa", yoni: "Rat",      yoniGender: "M", nadi: "Antya",  deity: "Pitris" },
  { number: 11, key: "purva-phalguni",    name: "Purva Phalguni",    lord: "Shukra",  gana: "Manushya", yoni: "Rat",      yoniGender: "F", nadi: "Madhya", deity: "Bhaga" },
  { number: 12, key: "uttara-phalguni",   name: "Uttara Phalguni",   lord: "Surya",   gana: "Manushya", yoni: "Cow",      yoniGender: "M", nadi: "Adi",    deity: "Aryaman" },
  { number: 13, key: "hasta",             name: "Hasta",             lord: "Chandra", gana: "Deva",     yoni: "Buffalo",  yoniGender: "F", nadi: "Adi",    deity: "Savitr" },
  { number: 14, key: "chitra",            name: "Chitra",            lord: "Mangal",  gana: "Rakshasa", yoni: "Tiger",    yoniGender: "F", nadi: "Madhya", deity: "Tvashtar" },
  { number: 15, key: "swati",             name: "Swati",             lord: "Rahu",    gana: "Deva",     yoni: "Buffalo",  yoniGender: "M", nadi: "Antya",  deity: "Vayu" },
  { number: 16, key: "vishakha",          name: "Vishakha",          lord: "Guru",    gana: "Rakshasa", yoni: "Tiger",    yoniGender: "M", nadi: "Antya",  deity: "Indra-Agni" },
  { number: 17, key: "anuradha",          name: "Anuradha",          lord: "Shani",   gana: "Deva",     yoni: "Deer",     yoniGender: "F", nadi: "Madhya", deity: "Mitra" },
  { number: 18, key: "jyeshtha",          name: "Jyeshtha",          lord: "Budha",   gana: "Rakshasa", yoni: "Deer",     yoniGender: "M", nadi: "Adi",    deity: "Indra" },
  { number: 19, key: "mula",              name: "Mula",              lord: "Ketu",    gana: "Rakshasa", yoni: "Dog",      yoniGender: "M", nadi: "Adi",    deity: "Nirriti" },
  { number: 20, key: "purva-ashadha",     name: "Purva Ashadha",     lord: "Shukra",  gana: "Manushya", yoni: "Monkey",   yoniGender: "M", nadi: "Madhya", deity: "Apas" },
  { number: 21, key: "uttara-ashadha",    name: "Uttara Ashadha",    lord: "Surya",   gana: "Manushya", yoni: "Mongoose", yoniGender: "M", nadi: "Antya",  deity: "Vishvadevas" },
  { number: 22, key: "shravana",          name: "Shravana",          lord: "Chandra", gana: "Deva",     yoni: "Monkey",   yoniGender: "F", nadi: "Antya",  deity: "Vishnu" },
  { number: 23, key: "dhanishta",         name: "Dhanishta",         lord: "Mangal",  gana: "Rakshasa", yoni: "Lion",     yoniGender: "F", nadi: "Madhya", deity: "Eight Vasus" },
  { number: 24, key: "shatabhisha",       name: "Shatabhisha",       lord: "Rahu",    gana: "Rakshasa", yoni: "Horse",    yoniGender: "F", nadi: "Adi",    deity: "Varuna" },
  { number: 25, key: "purva-bhadrapada",  name: "Purva Bhadrapada",  lord: "Guru",    gana: "Manushya", yoni: "Lion",     yoniGender: "M", nadi: "Adi",    deity: "Aja Ekapada" },
  { number: 26, key: "uttara-bhadrapada", name: "Uttara Bhadrapada", lord: "Shani",   gana: "Manushya", yoni: "Cow",      yoniGender: "F", nadi: "Madhya", deity: "Ahir Budhnya" },
  { number: 27, key: "revati",            name: "Revati",            lord: "Budha",   gana: "Deva",     yoni: "Elephant", yoniGender: "F", nadi: "Antya",  deity: "Pushan" },
]);

export function nakshatraFromLongitude(siderealLongitude) {
  const lon = normalizeDegrees(siderealLongitude);
  const index = Math.floor(lon / NAKSHATRA_SPAN);
  const offset = lon - index * NAKSHATRA_SPAN;
  const pada = Math.floor(offset / PADA_SPAN) + 1;
  const nak = NAKSHATRAS[index];
  return {
    ...nak,
    index,
    pada,
    degreeInNakshatra: offset,
    fractionElapsed: offset / NAKSHATRA_SPAN,
    startLongitude: index * NAKSHATRA_SPAN,
  };
}

export function nakshatraByKey(key) {
  return NAKSHATRAS.find((n) => n.key === String(key).toLowerCase()) || null;
}

export function nakshatraByNumber(number) {
  return NAKSHATRAS[(Number(number) - 1 + 27) % 27] || null;
}

