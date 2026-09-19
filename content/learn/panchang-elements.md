---
title: "The Five Limbs of the Panchang"
weight: 6
date: 2026-01-15
summary: "Tithi, vara, nakshatra, yoga, karana"
description: "How the Hindu calendar is built — the definitions and arithmetic behind tithi, vara, nakshatra, yoga and karana, all derived from two sidereal longitudes."
---

## Two numbers, five quantities

Everything in the panchang comes from the sidereal longitudes of the Sun and the Moon.

## Tithi

A tithi is 12° of elongation — the angular distance by which the Moon has pulled ahead of the
Sun.

```
tithi = floor( (Moon − Sun) ÷ 12° ) + 1
```

Thirty tithis complete a lunar month, split into two pakshas of fifteen: **Shukla** (waxing,
from new moon to full) and **Krishna** (waning). Tithi 15 is Purnima, the full moon; tithi 30
is Amavasya, the new moon.

A tithi is not a day. Because both bodies move at varying speeds, a tithi runs anywhere from
about 19 to 26 hours. It can therefore skip a civil date or occupy two of them — the source of
the *kshaya* and *adhika* tithi that calendar-makers have to handle.

## Vara

The weekday, counted from sunrise rather than midnight. Each vara is ruled by a graha, in the
order Surya, Chandra, Mangal, Budha, Guru, Shukra, Shani — the same order the seven-day week
carries in most languages, including English via the Norse and Roman equivalents.

## Nakshatra

The Moon's nakshatra, from its sidereal longitude divided by 13°20′. The Moon crosses about
one nakshatra a day.

## Yoga

Twenty-seven yogas, computed from the *sum* of the two longitudes:

```
yoga = floor( (Moon + Sun) ÷ 13°20′ ) + 1
```

Note the sum, not the difference — this is the one panchang element people most often
mis-derive. Certain yogas, notably Vyatipata and Vaidhriti, are traditionally avoided for
auspicious work.

## Karana

Half a tithi — 6° of elongation — giving 60 karanas in a lunar month. There are eleven names:
seven movable ones that repeat eight times through the month, and four fixed ones
(Shakuni, Chatushpada, Naga, Kimstughna) that occur once each around the new moon.

## Using it

Muhurta — choosing an auspicious time — weighs all five limbs together, plus the lagna at the
proposed moment and the transit positions. The [live panchang](/panchang/) computes all five
for any date and place, with the graha transits alongside.
