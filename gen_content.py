#!/usr/bin/env python3
"""Generate the data-driven markdown pages for JyotishVeda from the YAML datasets."""
import os, yaml, textwrap

ROOT = os.path.dirname(os.path.abspath(__file__))
C = os.path.join(ROOT, "content")

def load(name):
    with open(os.path.join(ROOT, "data", name), encoding="utf-8") as f:
        return yaml.safe_load(f)

rashi = load("rashi.yaml")
naks = load("nakshatras.yaml")
grahas = load("grahas.yaml")
bhavas = load("bhavas.yaml")

def ordinal(n):
    n = int(n)
    if 10 <= n % 100 <= 20:
        suf = "th"
    else:
        suf = {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")
    return f"{n}{suf}"

def tattva_note(t):
    return {
        "Agni (Fire)": "Fire signs act before they deliberate, generate their own momentum and lose interest once the thing is started rather than finished.",
        "Prithvi (Earth)": "Earth signs work in durable, material terms — what can be held, kept, measured or built on. Their weakness is inertia rather than haste.",
        "Vayu (Air)": "Air signs work through exchange: language, contact, comparison and agreement. They move information rather than matter.",
        "Jala (Water)": "Water signs work through absorption and retention. They register what happened and keep it, which is both their depth and their difficulty.",
    }[t]

def swabhava_note(s):
    return {
        "Chara (Movable)": "Movable signs begin things. They are associated with travel, change of position and the initiating phase of any cycle; the classical complaint about them is that they rarely stay for the ending.",
        "Sthira (Fixed)": "Fixed signs hold things. They are associated with accumulation, persistence and resistance to being moved; the classical complaint is that they hold on past the point of usefulness.",
        "Dwisvabhava (Dual)": "Dual signs adapt and distribute. They sit between the fixed and movable phases, and are associated with mediation, teaching, transition and doing two things at once.",
    }[s]

def classification_note(c):
    parts = []
    if "Kendra" in c:
        parts.append("**Kendra** (angular — houses 1, 4, 7, 10) are the pillars of the chart. Grahas here act visibly and with force. The classical quirk is that natural benefics gain and natural malefics lose some of their ability to harm from a kendra.")
    if "Trikona" in c:
        parts.append("**Trikona** (trinal — houses 1, 5, 9) are the fortunate houses, associated with dharma, merit and support. No graha is considered to do badly from a trikona.")
    if "Dusthana" in c:
        parts.append("**Dusthana** (houses 6, 8, 12) are the difficult houses, associated with loss, illness, crisis and expenditure. Grahas placed here are weakened for ordinary worldly matters, though the same placement can be excellent for research, healing, seclusion and spiritual work.")
    if "Upachaya" in c:
        parts.append("**Upachaya** (growing — houses 3, 6, 10, 11) improve over time. Malefics here are considered useful rather than harmful, because struggle in these areas converts into capability.")
    if "Maraka" in c:
        parts.append("**Maraka** (houses 2 and 7) are the houses examined in longevity work. The label is a technical one used in that specific calculation and is not a prediction about anyone.")
    if "Panapara" in c:
        parts.append("**Panapara** (succedent — houses 2, 5, 8, 11) follow the angles and are associated with resources and sustaining what the angles began.")
    if "Apoklima" in c:
        parts.append("**Apoklima** (cadent — houses 3, 6, 9, 12) precede the angles and are associated with transition, learning and release.")
    if "Moksha" in c:
        parts.append("**Moksha-sthana** (houses 4, 8, 12) concern release and the inner life rather than worldly outcome.")
    return "\n\n".join(parts) if parts else c

def write(path, text):
    full = os.path.join(C, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8", newline="\n") as f:
        f.write(text.strip() + "\n")

def fm(**kw):
    lines = ["---"]
    for k, v in kw.items():
        if isinstance(v, bool):
            lines.append(f"{k}: {str(v).lower()}")
        elif isinstance(v, int):
            lines.append(f"{k}: {v}")
        else:
            v = str(v).replace('"', "'")
            lines.append(f'{k}: "{v}"')
    lines.append("---")
    return "\n".join(lines)

# ---------------------------------------------------------------- rashi
for key, r in rashi.items():
    lord_key = r["lord_key"]
    lord = grahas[lord_key]
    body = f"""
## What {r['name']} actually is

{r['name']} is the stretch of the sidereal zodiac from {r['span']}, counted from the fixed
star reference point rather than from the spring equinox. That difference — the ayanamsha —
is currently a little over 24°, which is why a person called {r['english']} by a Western
magazine is often a different rashi in Jyotish. The rashi that matters most in Indian
astrology is the one holding the **Moon** at birth, not the Sun.

Being the {ordinal(r['index'] + 1)} rashi makes {r['name']} a {r['tattva'].split(' ')[0].lower()}-element,
{r['swabhava'].split(' ')[0].lower()}-mode sign ruled by {r['lord']}. Those three facts —
element, mode and lord — carry most of the interpretive weight. {r['summary']}

## The three structural facts

**Tattva: {r['tattva']}.** The element describes the medium the sign works in.
{tattva_note(r['tattva'])}

**Swabhava: {r['swabhava']}.** {swabhava_note(r['swabhava'])}

**Lord: {r['lord']}.** A rashi is read through its ruler. Wherever {r['lord']} sits in a chart,
and whatever condition it is in, is where the affairs of {r['name']} are actually decided.
{r['lord'].split(' ')[0]} signifies {lord['karaka'].lower()}. It is exalted in {lord['exalted']} and
debilitated in {lord['debilitated']}, and runs a {lord['dasha_years']}-year Vimshottari period.

## Traits the tradition associates with {r['name']}

Classical texts describe the {r['name']} native through the sign's emblem — {r['emblem'].lower()} —
and through its {r['tattva'].split(' ')[0].lower()} element. The recurring descriptions are
{', '.join(t.lower() for t in r['traits'][:-1])} and {r['traits'][-1].lower()}.

Read this carefully: these are descriptions of one factor in a chart, not of a person. A
{r['name']} Moon in the 6th bhava with an afflicted {r['lord']} looks nothing like a
{r['name']} Moon in the 5th with {r['lord']} exalted. The rashi supplies the flavour; the
bhava, the lord's condition and the running dasha supply the substance.

## The nakshatras inside {r['name']}

{r['name']} contains {r['nakshatras']}. Because the nakshatra system divides the same circle
into 27 rather than 12, most rashis share a nakshatra with a neighbour. Where inside these
{r['span']} the Moon falls determines the janma nakshatra, the pada, and — crucially — which
graha's mahadasha the person is born into.

## Kalapurusha and the body

In the Kalapurusha scheme the twelve rashis map onto a single cosmic body from head to foot.
{r['name']}, as rashi number {r['index'] + 1}, corresponds to **{r['body_part'].lower()}**. In
medical Jyotish this correspondence is read alongside the 6th bhava and the condition of the
rashi lord; it is a traditional framework and not a substitute for a doctor.

## Traditional associations

The day associated with {r['name']} is {r['lucky_day']}, the day of its lord. The colour
group is {r['lucky_colour'].lower()}, the number is {r['lucky_number']}, and the stone
traditionally prescribed for strengthening {r['lord']} is {r['gem']}.

The beeja mantra for the rashi lord is *{r['mantra']}*, traditionally recited on
{r['lucky_day']}s. Gemstone prescription in particular should not be done from a rashi page —
a stone strengthens a graha, and strengthening a graha that rules a difficult bhava for your
lagna is the opposite of helpful.
"""
    write(f"rashi/{key}.md", fm(
        title=f"{r['name']} Rashi ({r['english']})",
        key=key,
        weight=r["index"] + 1,
        summary=f"{r['english']} · {r['lord']}",
        description=f"{r['name']} rashi spans {r['span']} of the sidereal zodiac under {r['lord']}. Element, mode, nakshatras, traits and the traditional associations, with the arithmetic shown.",
        date="2026-01-15",
    ) + "\n\n" + body)

# ------------------------------------------------------------ nakshatra
for key, n in naks.items():
    r = rashi[n["rashi"]]
    body = f"""
## Position in the circle

{n['name']} is nakshatra number {n['number']} of 27, occupying {n['span']}. Every nakshatra is
exactly 13°20′ wide, because 360° ÷ 27 = 13°20′. Divide that again by four and you get the
four padas of 3°20′ each, which is how a nakshatra is subdivided for the navamsha and for
name-syllable selection.

Its starting sidereal longitude is {n['start']}°. If the Moon's sidereal longitude at birth
falls between {n['start']}° and {round(n['start'] + 13.3333, 4)}°, {n['name']} is the janma
nakshatra.

## Lord, deity and symbol

**Lord: {n['lord']}.** This is the single most consequential fact on the page. The nakshatra
lord of the Moon decides which mahadasha a person is born into, and the fraction of the
nakshatra already crossed decides how much of that period is left. A birth in {n['name']}
means the Vimshottari sequence opens with {n['lord'].split(' ')[0]}.

**Deity: {n['deity']}.** The presiding deity is not decoration — in the classical method the
deity is the interpretive key. {n['deity']} tells you what the nakshatra is *for*.

**Symbol: {n['symbol']}.** The symbol gives the concrete image the tradition thinks with:
{n['summary'].lower()}

## Classification

| Category | {n['name']} | What it is used for |
| --- | --- | --- |
| Gana | {n['gana']} | Temperament matching in Guna Milan (6 of 36 points) |
| Yoni | {n['yoni']} | Instinctive compatibility (4 of 36 points) |
| Nadi | {n['nadi']} | The most heavily weighted koota (8 of 36 points) |
| Varna | {n['varna']} | Traditional social-function grouping (1 point) |
| Guna | {n['guna']} | The quality of activity the nakshatra expresses |
| Direction | {n['direction']} | Used in muhurta and vastu applications |

A {n['gana']} gana with {n['nadi']} nadi is the combination that will show up when this
nakshatra is used in kundali matching. Nadi carries eight points on its own, and an identical
nadi on both sides scores zero, so {n['name']} pairs poorly on that one koota with every other
{n['nadi']}-nadi nakshatra regardless of how well the rest of the chart fits.

## Themes

The keyword cluster for {n['name']} is {', '.join(n['keywords'])}. Work traditionally
associated with the nakshatra: {n['careers'].lower()}.

These associations come from the deity and symbol rather than from any statistical study.
They are worth reading as a description of a *mode of action* — the way this part of the
sky is said to get things done — rather than as a career recommendation.

## Where it sits among the rashis

{n['name']} falls in {r['name']} ({r['english']}), the {r['tattva'].lower()} rashi ruled by
{r['lord']}. That means two rulerships operate at once: {n['lord'].split(' ')[0]} as nakshatra
lord and {r['lord'].split(' ')[0]} as rashi lord. When the two are natural friends the
nakshatra expresses smoothly; when they are enemies the tradition expects internal tension in
whatever the Moon signifies for that person.

## Padas

The four padas of {n['name']} each span 3°20′ and map onto the navamsha chart, which is
examined for marriage and for the deeper strength of every graha. Two people born under this
nakshatra in different padas can have substantially different navamsha charts. The
[Nakshatra Finder](/tools/nakshatra-finder/) returns the exact pada along with the
traditional name syllable.
"""
    write(f"nakshatra/{key}.md", fm(
        title=f"{n['name']} Nakshatra",
        key=key,
        weight=n["number"],
        summary=f"{n['lord']} · {n['gana']} gana",
        description=f"{n['name']} nakshatra spans {n['span']}, ruled by {n['lord']} with deity {n['deity']}. Gana, yoni, nadi, padas and its role in dasha and matching.",
        date="2026-01-15",
    ) + "\n\n" + body)

# ---------------------------------------------------------------- graha
for key, g in grahas.items():
    shadow = key in ("rahu", "ketu")
    body = f"""
## What {g['name']} signifies

{g['name']} — {g['english']} — is graha number {g['order']} in the standard ordering. Its
karakatva, the set of things it signifies, is: {g['karaka']}.

{g['summary']}

{"Rahu and Ketu are not physical bodies. They are the two points where the Moon's orbital plane crosses the ecliptic, always exactly 180° apart, and always moving backwards through the zodiac. Because they are mathematical points rather than objects, they own no rashi and act through whichever graha rules the sign they occupy." if shadow else f"{g['name']} is a physical body whose position is computed from an astronomical ephemeris. Everything this site reports for {g['name']} can be checked against any other ephemeris — the positions are not a matter of interpretation."}

## Dignity

| Condition | Placement |
| --- | --- |
| Own sign | {g['own']} |
| Moolatrikona | {g['moolatrikona']} |
| Exaltation | {g['exalted']} |
| Debilitation | {g['debilitated']} |

Dignity is the first thing a reader checks. A graha in its own sign or exaltation delivers
its significations readily; the same graha debilitated delivers them with friction, delay or
distortion. Neither is a verdict on its own — a debilitated graha with a strong dispositor,
or one whose debilitation is cancelled, behaves very differently from the textbook case.

## Relationships

{g['name']} counts {g['friends']} as natural friends and {g['enemies'] if g['enemies'] != 'None' else 'no graha'} as
{"enemies" if g['enemies'] != 'None' else 'an enemy'}, with {g['neutral']} neutral. These
relationships drive the Graha Maitri koota in kundali matching, where the two rashi lords are
compared and up to five of the thirty-six points are awarded on the strength of that
friendship.

## Aspects

{g['name']} casts {g['aspects'].lower()}. Every graha aspects the 7th house from itself; Mars,
Jupiter and Saturn have additional special aspects, and the nodes are given the Jupiter-like
5th, 7th and 9th by many schools. An aspect is read as {g['name']} extending its nature onto
the aspected bhava and its occupants.

## Timing: the {g['dasha_years']}-year period

In the Vimshottari system {g['name']} holds a mahadasha of **{g['dasha_years']} years** out of
the 120-year cycle. The dasha opens with whichever graha rules the Moon's birth nakshatra —
for {g['name']} that means {g['nakshatras']}. During its own period a graha delivers the
results indicated by its house position, sign, dignity and aspects; outside that period it
works mostly through transit.

You can see the whole sequence for a specific birth with the
[Vimshottari Dasha calculator](/tools/vimshottari-dasha/).

## Traditional associations and remedies

| Association | {g['name']} |
| --- | --- |
| Weekday | {g['day']} |
| Direction | {g['direction']} |
| Gemstone | {g['gem']} |
| Metal | {g['metal']} |
| Deity | {g['deity']} |
| Beeja mantra | *{g['mantra']}* |
| Nature | {g['nature']} |

Remedial measures in the tradition run from mantra recitation and fasting on the graha's
weekday to charity associated with its significations. Gemstones are the most commonly sold
remedy and the one requiring most caution: a stone strengthens a graha, and strengthening a
graha that rules a difficult bhava for your particular lagna can work against you. Nothing on
this page should be treated as a prescription, and none of it replaces medical, legal or
financial advice.
"""
    write(f"graha/{key}.md", fm(
        title=f"{g['name']} ({g['english']})",
        key=key,
        weight=g["order"],
        summary=f"{g['english']} · {g['dasha_years']}-year dasha",
        description=f"{g['name']} in Vedic astrology: significations, own sign {g['own']}, exaltation, debilitation, aspects, the {g['dasha_years']}-year Vimshottari period and traditional remedies.",
        date="2026-01-15",
    ) + "\n\n" + body)

# ---------------------------------------------------------------- bhava
for key, b in bhavas.items():
    body = f"""
## The {ordinal(b['number'])} bhava in one paragraph

The {b['name']} — {b['english']} — covers {b['themes'].lower()}. It is classified as
**{b['classification']}**, its natural karaka is **{b['karaka']}**, and it belongs to the
**{b['purushartha']}** group of life aims.

{b['summary']}

## How the bhava is actually read

There are four questions, asked in order:

1. **Which rashi falls here?** On this site houses are whole-sign, so the rashi and the bhava
   are the same thing. If Mesha rises, Mesha is the entire 1st bhava, Vrishabha the entire
   2nd, and so on.
2. **Where is the lord of that rashi?** The lord's own placement usually matters more than
   anything sitting in the bhava. A {b['number']}th lord in a kendra or trikona supports the
   affairs of this house wherever it sits.
3. **What occupies the bhava, and what aspects it?** Occupants colour the house directly;
   aspects modify it from a distance.
4. **What does the karaka say?** For the {ordinal(b['number'])} bhava that is {b['karaka']}.
   A house and its karaka should agree before you commit to a reading.

## Classification: {b['classification']}

{classification_note(b['classification'])}

## Purushartha: {b['purushartha']}

The twelve bhavas fall into four groups of three, matching the four aims of life — dharma
(purpose), artha (resources), kama (desire) and moksha (release). The
{ordinal(b['number'])} belongs to **{b['purushartha']}**, which puts it in the same group as
the {', '.join(ordinal(x['number']) for k2, x in bhavas.items() if x['purushartha'] == b['purushartha'] and x['number'] != b['number'])}.
Houses in one group tend to be read together.

## Body correspondence

The {ordinal(b['number'])} bhava corresponds to {b['body'].lower()}. Medical Jyotish reads this
alongside the 6th bhava, the 8th for chronic matters and the condition of the relevant karaka.
This is a traditional framework for study, not a diagnostic method.

## When this bhava is considered strong

{b['strong_when']}.

Strength is never read from a single indicator. A bhava with a well-placed lord, a benefic
occupant and a supportive dasha behaves quite differently from the same bhava with the lord in
a dusthana, however promising the occupants look.
"""
    write(f"bhava/{key}.md", fm(
        title=f"{b['name']} — {ordinal(b['number'])} House",
        key=key,
        weight=b["number"],
        summary=b["english"],
        description=f"The {ordinal(b['number'])} bhava ({b['name']}) in Vedic astrology: {b['themes'].lower()}. Classification, karaka, purushartha and how the house is actually read.",
        date="2026-01-15",
    ) + "\n\n" + body)

# -------------------------------------------------------------- rashifal
for key, r in rashi.items():
    body = f"""
## How this reading is produced

There is no pre-written text for today. When this page loads, your browser computes the
current sidereal positions of the Moon, Sun, Jupiter and Saturn, counts how many rashis each
one sits from {r['name']}, and assembles the reading from what the classical gochar (transit)
rules say about those positions.

The Moon changes rashi roughly every two and a quarter days, which is why the daily reading
changes. The Sun changes monthly, Jupiter roughly yearly, Saturn roughly every two and a half
years — those set the background tone.

## What the transit houses mean

Counting from your janma rashi, this site uses the classical Chandra gochar rule that treats the
1st, 3rd, 6th, 7th, 10th and 11th from the janma rashi as favourable, while the 2nd, 4th, 5th,
8th, 9th and 12th are not counted among the favourable houses. The basic rule is shown here
without adding separate Vedha exceptions, so you can check the logic rather than take the verdict.

## Using it honestly

{r['name']} here means your **janma rashi** — the rashi holding the Moon at your birth — not
your Sun sign. If you have never calculated it, the
[Janma Rashi calculator](/tools/moon-rashi-calculator/) will tell you in a few seconds, and it
is frequently not the sign people expect.

A transit reading describes one layer. The same transit lands differently depending on your
lagna, the condition of {r['lord']} in your own chart, and the mahadasha you are running. For
anything that matters, read the transit against the birth chart rather than on its own.
"""
    write(f"rashifal/{key}.md", fm(
        title=f"{r['name']} Rashifal",
        key=key,
        weight=r["index"] + 1,
        summary=f"Daily and weekly for {r['english']}",
        description=f"Daily and weekly rashifal for {r['name']} ({r['english']}), computed live from the actual transit positions of the Moon, Sun, Jupiter and Saturn relative to your janma rashi.",
        date="2026-01-15",
    ) + "\n\n" + body)

print("generated data-driven pages")

