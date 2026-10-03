# At the Threshold: picture-led redesign (version 2)

**Recorded:** 2026-10-03
**Status:** implemented on `claude/dazzling-mayer-1apqdu`. This is a candidate for instructor and specialist content review.

This document records the instructor's later decisions. Where they conflict with [the content specification](experience-content-spec.md) and [the architecture](experience-architecture.md), these decisions win, because the handoff says a later user instruction takes precedence.

## What changed and why

The instructor did not want students to think about text boxes. The six pictures themselves should carry the learning, through hotspots and descriptions that help students reconstruct an early Christian house-church gathering. Reflection still had to be explicit.

The instructor approved a clickable mock-up of the meal picture before the full build.

| Decision | Result in the app |
|---|---|
| Remove all text boxes | Students type nothing. The opening and closing thought fields, the observation fields, "my thinking now", and the brief notes are all removed. The saved format is now version 2 and holds no free text. |
| Hotspots on every picture | 5 numbered details per picture. Each opens *In the picture*, *From the sources* (tagged with its source, or as *Interpretation*), and *What the picture can't tell us*. |
| Change the lens | The same details can be seen as **the host, a household worker, a traveler, or a neighbor**. Every voice is invented and labeled **Fictional perspective**. |
| Outside the frame | Four questions around each picture: before, who's missing, who served or decided, and what happens next. Each answer is either sourced (S-id) or marked *Interpretation* or *Not recorded*. |
| Keep the dilemmas, after the hotspots | The authored situations, choices, and responses are unchanged. They are now click-only. Deep pictures (E1, E2, E5) keep the first choice and add "Your view now". |
| Case question per picture | Students rule *Supported / Partly supported / Not established*, then read how a historian might argue each ruling. The app never declares a single right ruling. |
| Sort what you learned (explicit reflection) | 4–5 statements per picture are sorted into *In the picture / In a historical source / Not established*. Students then see how a historian might sort them. A different placement gets a neutral explanation, not a score. |
| Closing | "Your reconstruction of the gathering" groups every sorted statement into those three columns, lists each ruling and decision, and ends with three questions to carry into class or the instructor's assignment. |
| Visual style | [Groovy style](https://github.com/chrismccoy/claude-design-styles/blob/master/spec/groovy.md) from `chrismccoy/claude-design-styles`: Righteous and DM Sans, the warm 70s palette, chunky 3 px outlines with hard offset shadows, irregular rounded cards, pill buttons, a rotated sticker, and tinted wavy section bands. |

## Deviations from the Groovy spec, kept on purpose

- **Text on buttons.** Filled buttons that carry text use the palette's **rust** (#b7410e) with white text instead of orange. White on the spec's orange (#e8621a) is about 3.2:1, which is too low for body-size text. Orange still fills the markers, step badges and tags, with dark text on top, and colors the large display headings.
- **No dark mode.** The spec is a single warm light theme, so the app is light-only and declares `color-scheme: light`.
- **Google Fonts is progressive.** If the fonts don't load, the stacks fall back to Trebuchet MS and system sans. The offline packet uses the same palette with local font fallbacks only, so it makes no network requests.

## Content written for this version (needs instructor review)

All of it lives in `src/content/encounters.js` and is mirrored in `experience-packet.html`.

- **30 hotspots** (5 per picture), each with its *see*, *context* and *limit* text and **4 invented voices** (120 voices in total).
- **24 outside-the-frame questions** with answers.
- **6 case questions**, each with 3 ruling explanations.
- **27 sort statements**, each with a historian's placement and an explanation.

The most important items to review:

- **E2 (meal):** the Eucharist wording ("Justin says only the baptized took part", First Apology 66), and the claim in the sort that this meal cannot be identified as the Eucharist.
- **E1 (letter):** the *Didache* 12 paraphrase about how long travelers may stay and the expectation that settlers work. Also the interpretive claim that most groups before the third century met in houses or rented rooms.
- **E4 (circle):** the voices imagine status and dependence; check that none of them reads as a stereotype. The Pliny "every rank" paraphrase.
- **E6 (shrine):** the voices of the host and worker about household religion, and the Pliny/Trajan summaries (Letters 10.96–97).
- **The "neighbor" lens** voices suspicion and rumor in places. These are deliberately fictional, but check the tone.
- **Hotspot positions** were placed by eye and adjusted after screenshots so markers don't cover faces. Spot-check them on a projector.

The prompts I added for E3/E4/E6 in version 1 remain as the decision legends.

## What was not changed

These all work as before:

- the six images and their IDs
- the source records S1–S5
- the image limitations and descriptions
- local saving with honest status
- conflict and recovery handling
- backup and restore
- reset
- the descriptions-only mode
- the offline packet (regenerated)
- the single Pages workflow

Version 1 saved data (with typed notes) is not migrated. It goes through the existing recovery path, where the raw data is offered for download and is never overwritten automatically.
