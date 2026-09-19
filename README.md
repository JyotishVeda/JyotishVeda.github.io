# JyotishVeda

A Hugo static site about Jyotish (Vedic / Indian astrology), built on the same architecture as
AstroLight but with its own subject matter, data, calculation engine and visual identity.

## Quick start

```bash
hugo server -D          # local preview at http://localhost:1313
hugo                    # production build into public/
```

Requires Hugo extended (built and tested against v0.140.2).

## Before you publish

1. **`hugo.toml`** — set `baseURL` to your real domain.
2. **`hugo.toml`** — set `adsenseClientId` to your AdSense publisher ID
   (`ca-pub-XXXXXXXXXXXXXXXX`). While it is empty, no ad code is emitted at all,
   which is the correct state for a pre-approval submission.
3. **`static/ads.txt`** — replace the placeholder publisher ID.
4. **`content/contact.md`** — replace `mankeshwaracreations@gmail.com` with a real address.
5. Ad slot IDs in the layouts are placeholders (`1111111111` etc.). Replace them with
   your real slot IDs once AdSense has issued them.

## Structure

```
hugo.toml              site config, menu, params
assets/css/main.css    full stylesheet (saffron / marigold / night-indigo)
data/                  rashi, nakshatras, grahas, bhavas — the source of truth
content/               markdown pages (generated for the data-driven sections)
layouts/               per-section templates, all data-driven
static/js/vedic/       the sidereal calculation engine
static/js/tools/       per-tool page controllers
static/js/visualization/  star field + kundali SVG renderers
gen_content.py         regenerates the data-driven markdown from data/*.yaml
```

## Content

- 12 rashi pages, 27 nakshatra pages, 9 graha pages, 12 bhava pages
- 12 rashifal pages plus a combined index
- 7 calculators and a live panchang
- 8 long-form Learn articles on the underlying mathematics
- about / contact / privacy-policy / disclaimer / terms

To change a fact everywhere it appears, edit the YAML in `data/` and re-run
`python3 gen_content.py` (requires PyYAML) to refresh the prose, or just rebuild —
the layouts read the YAML directly for every table.

## The calculation engine

Everything runs client-side. Tropical positions come from
[astronomy-engine](https://github.com/cosinekitty/astronomy) loaded from a CDN; the
Lahiri (Chitrapaksha) ayanamsha is subtracted to give sidereal values.

| Module | Purpose |
| --- | --- |
| `ayanamsha.js` | Lahiri ayanamsha, Julian day, angle formatting, local→UTC |
| `rashi.js` | 12 rashis, longitude → rashi, Vedic counting |
| `nakshatra.js` | 27 nakshatras, pada, gana / yoni / nadi |
| `grahas.js` | 9 graha sidereal longitudes, retrogression, mean nodes |
| `kundali.js` | Lagna from LST + latitude, whole-sign bhavas, pada syllables |
| `dasha.js` | Vimshottari mahadasha / antardasha, balance at birth |
| `panchang.js` | Tithi, vara, nakshatra, yoga, karana |
| `milan.js` | Full 36-point Ashtakoota Guna Milan |
| `dosha.js` | Mangal dosha, Sade Sati, Kaal Sarp |
| `rashifal.js` | Transit-based daily/weekly readings (deterministic, not random) |
| `places.js` | Built-in city coordinates, no geocoding API needed |

Conventions: Lahiri ayanamsha, whole-sign houses, mean lunar nodes, 365.2425-day
dasha year. The Vashya and Yoni kootas are simplified, and each simplification is
printed next to the score it affects.

**No birth data is ever transmitted.** Every calculator runs in the visitor's browser.

## AdSense notes

The site ships with the pages a review normally expects: About, Contact, Privacy Policy
(including the third-party vendor / Google Ads Settings disclosures), Disclaimer and
Terms of Use, all linked from the footer of every page. Ad slots render nothing while
`adsenseClientId` is empty.

