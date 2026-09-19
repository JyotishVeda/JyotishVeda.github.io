---
title: "How the Lagna Is Calculated"
weight: 5
date: 2026-01-15
summary: "Sidereal time, latitude and one formula"
description: "The mathematics behind the ascendant in Vedic astrology — local sidereal time, obliquity, the ascendant formula, and why birth time accuracy matters so much."
---

## What the lagna is

The lagna, or ascendant, is the point of the ecliptic crossing the eastern horizon at a given
moment and place. It is the only chart factor that depends on the observer's position on
Earth, and it is what makes a birth chart a chart of *you* rather than of a date.

## Three inputs

**Local sidereal time (θ).** Sidereal time tracks the rotation of the Earth against the stars
rather than against the Sun. Greenwich sidereal time comes from the ephemeris; the local value
adds the geographic longitude:

```
θ = GST × 15° + longitude east
```

**Obliquity (ε).** The tilt of the Earth's axis relative to its orbital plane, currently about
23.44° and decreasing slowly.

**Latitude (φ).** The observer's geographic latitude, north positive.

## The formula

```
Asc = atan2( cos θ , −( sin θ · cos ε + tan φ · sin ε ) )
```

That yields the tropical ascendant. Subtract the ayanamsha and you have the sidereal lagna
used in a Jyotish chart.

The `tan φ` term is why latitude matters. At the equator the horizon cuts the ecliptic at a
constant angle and signs rise evenly. At high latitudes some signs rise in minutes and others
take hours — the "signs of long and short ascension" the classical texts describe.

## Why the birth time matters so much

The lagna advances roughly 1° every four minutes, completing all twelve rashis in 24 hours.

- Four minutes ≈ 1° of lagna
- Two hours ≈ a whole rashi, and therefore a completely different chart

An error of even ten minutes can change the nakshatra pada of the lagna, and an error of an
hour or two changes which rashi falls in every single bhava. This is why Jyotish takes birth
time so seriously, and why the traditional technique of **birth-time rectification** exists —
working backwards from known life events to refine an uncertain time.

Where the birth time is genuinely unknown, the Moon's rashi and nakshatra remain usable
(the Moon moves only about half a degree an hour), and much of Jyotish can be done from the
Chandra lagna instead. The bhavas, however, cannot be trusted at all.
