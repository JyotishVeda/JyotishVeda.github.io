---
title: "Ayanamsha: The 24° That Separates Two Zodiacs"
weight: 1
date: 2026-01-15
summary: "Why sidereal and tropical charts disagree"
description: "What the ayanamsha is, why the Lahiri value is used in India, how it is calculated, and why your Vedic rashi is usually one sign behind your Western sun sign."
---

## Two starting points

A zodiac needs an origin — a point on the circle called 0°. Both astrological traditions use
360° divided into twelve, and they disagree on nothing except where to start counting.

**Tropical** astrology starts at the vernal equinox: the point where the Sun crosses the
celestial equator moving north, around 21 March. **Sidereal** astrology, which Jyotish uses,
starts from a fixed point defined against the stars.

If the equinox stayed put, the two would agree forever. It does not.

## Precession

The Earth's axis wobbles like a slowing top, one full circuit every 25,800 years or so. The
equinox therefore slides backwards along the ecliptic at about 50.3 arcseconds a year — one
degree every 72 years.

Around the middle of the first millennium CE the two zodiacs coincided. Since then the gap has
opened at roughly a degree every seventy-two years, and it now stands a little under 24°.

That gap is the **ayanamsha** — literally "the portion of the ayana", the precessional
component.

## The conversion

```
sidereal longitude = tropical longitude − ayanamsha
```

If the Sun's tropical longitude is 10° Mesha (10°) and the ayanamsha is 24°, the sidereal
longitude is 346° — which lands in Meena. The same Sun, described from two origins.

Because the offset is currently just under one full rashi, most people find their Vedic rashi
is the sign *before* their Western one. Anyone born in roughly the last quarter of a Western
sign's span keeps the same sign name in both systems.

## Which ayanamsha?

There is no single official value, because "a fixed point against the stars" can be defined in
more than one way. Several are in use:

- **Lahiri (Chitrapaksha)** — defined so that the star Chitra (Spica) sits at 180° sidereal.
  Adopted by the Indian Calendar Reform Committee and used by the Government of India. This is
  the value used throughout this site.
- **Raman** — about 1.2° smaller than Lahiri.
- **Krishnamurti (KP)** — very close to Lahiri, used in the KP system.
- **Fagan–Bradley** — about 0.9° larger, common in Western sidereal work.

The disagreements are under two degrees. For a rashi that almost never matters; for a
nakshatra pada boundary or a close ascendant degree, it occasionally does.

## How this site computes it

The Lahiri value at J2000.0 is taken as 23° 51′ 24″. Accumulated precession is then applied
using the standard polynomial:

```
precession (arcseconds) = 5038.7784·T − 1.07259·T² − 0.001147·T³
```

where `T` is Julian centuries from J2000.0. Every tool prints the ayanamsha it applied, so any
result here can be reconciled with other software — if two programs disagree about a chart,
the ayanamsha is the first thing to compare.
