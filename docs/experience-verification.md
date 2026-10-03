# At the Threshold — implementation verification

**Recorded:** 2026-10-03.
**Branch:** `claude/dazzling-mayer-1apqdu`.
**Baseline:** `f2fc8c5922ee9ab9d895ad1d07c6518eeb37ed49`. This is the revision the specifications describe. The tree was clean at the start, and nothing had drifted from what the documents describe.

This file records only checks that were actually run. Items marked **unverified** were not performed.

## Version 2: picture-led, no text boxes, Groovy style (current)

The design changes are recorded in [experience-picture-led.md](experience-picture-led.md). The version 1 record further down still describes the checks that carry over unchanged, such as storage, routing, and the subpath.

### Checks run for version 2

| Command | Result |
|---|---|
| `npm run lint` | Passed: 0 warnings, 0 errors. |
| `npm test` | **21 passed, 0 failed.** Covers: <ul><li>reducer rules for hotspots, outside-frame questions, sources, the first choice (captured once), verdicts, and sorting</li><li>the reconstruction board</li><li>storage: empty, loaded, malformed, `null`, old v1 notes, future, other-experience, denied, and quota cases</li><li>reset that removes only its own key</li><li>the schema whitelist</li><li>JSON roundtrip and import limits</li><li>export content with no scoring language</li><li>content manifest, lens voices, and four frame questions per picture</li><li>a check that no writing prompts remain</li><li>validator failure cases</li></ul> |
| `npm run build` | Passed. `check-dist` asserts that the packet contains every choice response, hotspot text, context, lens voice, outside-frame answer, ruling explanation, and sort explanation. Also that no model, video, panorama, or Blender files are deployed. |
| `npm run test:e2e` | **23 passed, 0 failed** (Chromium, production preview). |

The browser journeys run with Google Fonts requests blocked, so they don't depend on the network. They cover:

- **No text boxes:** zero `textarea` or text inputs on all 9 routes.
- **Exploring a picture:**
  - Hotspots open by marker and by list, and the right panel and source tag appear.
  - Each lens changes the voice and shows the fictional-perspective label and note.
  - The explored state is saved.
  - Outside the frame moves focus to its first question, and the answer appears with its tag.
- **Meal journey:** decide → response → "Your view now" → ruling → sort → historian's placement.
  - After a reload, the first choice, current choice, ruling, and sorts are all preserved.
  - The closing board puts statements in the learner's columns, with the historian's note.
  - The downloaded reconstruction contains the board and the decisions.
- **Other decision paths:**
  - Neutral feedback when no choice is made.
  - Recall shows the earlier decision or links back to it.
  - E6 caption support is explained without a score.
- **Storage problems:**
  - Blocked storage warns and still exports.
  - Full storage reports itself.
  - Old v1 notes and malformed data are never overwritten, and v1 data can be downloaded first.
  - Backup import is validated; cancel and restore both work.
  - Reset can be cancelled, and confirmed reset leaves the legacy key alone.
  - A change in a second tab pauses saving.
- **Other routes and states:**
  - An invalid route is recoverable.
  - Descriptions only makes 0 image requests, and details and frame questions still work.
  - Blocked images leave a description and working controls.
- **Keyboard:**
  - A marker opens with Enter, and the lens works.
  - The image dialog closes with Escape and returns focus to its button.
  - Radio arrows, Tab to the response button, and focus on the heading after navigation all work.
- **Small screens:** no horizontal scroll at 320 px, including with the frame open.
- **Offline and hosting:**
  - The packet over `file://` makes 0 network requests and contains the details, frame questions, responses, and sort answers.
  - No-JS visitors get a working packet link.
  - Hosting under the project subpath works with 0 failed responses.

### Follow-up: hide the dots, smaller dots, label at the bottom right

- `npm test`: **22 passed** (adds a test that the hide-dots preference is saved and validated).
- `npm run test:e2e`: **25 passed**. Two new checks:
  - Hiding the dots removes all markers. The choice persists across pictures and through a reload, and the details list still works.
  - A dot measures 24–28 px, and the label sits in the bottom-right corner of the picture.
- Screenshot of the meal picture with the dots shown and hidden: confirmed visually.

### Visual checks (screenshots, Chromium, 1366 px)

- The start page and the meal page were inspected with the real Righteous and DM Sans fonts. For screenshots only, the font files were served through curl, because the sandbox's headless browser rejects the proxy certificate for Google Fonts.
- All six pictures were checked with their markers overlaid. Eight markers that covered faces or hid their object were moved and then rechecked:
  - E1 woman
  - E2 older woman and courtyard
  - E3 reader and both listeners
  - E4 woman in purple
  - E6 statue

### Performance (version 2)

- First picture (`#/encounter/letter`), localhost, cold, fonts blocked: 5 requests, **480.2 KiB** uncompressed.
- Google Fonts, measured separately with curl (Latin subsets): about **104 KiB**:
  - Righteous: 12.8 KiB
  - DM Sans variable: 62.7 KiB
  - DM Sans italic: 28.5 KiB, loaded only if italic text appears
- Total is about 590 KiB, under the 1.5 MiB budget. Throttled-mobile timing is still **unverified**.

### Still unverified for version 2

- Screen-reader pass.
- Measured contrast audit. Contrast was reasoned from the palette values, not measured:
  - ink on cream, mustard, or orange fills: dark-on-light, comfortably above 4.5:1
  - white on rust buttons: about 5.6:1
  - orange is used only for large display text and for fills behind dark text
- Real-device and 200% zoom checks.
- GitHub Actions run and live deployment.
- Instructor/specialist review of the new hotspot, voice, frame, ruling, and sort copy (see the review list in experience-picture-led.md).
- A learner pilot.

### Known limitation found while testing

Saving is cautious across tabs. If a learner opens a picture in a second tab before the first tab has saved, the second tab records the visit. The first tab then pauses saving and asks which version to keep. Nothing is lost, but it can surprise someone who opens several tabs at once. The notice already advises using one tab. The browser test now waits for the first tab's save, so it checks the intended conflict path reliably (10/10 repeated runs).

---

## Version 1 record (text-box design, superseded)

## Environment

- Linux container, with Node 22.22.0 and npm 10.9.4.
- Chromium came preinstalled at `/opt/pw-browsers/chromium-1194`, and `@playwright/test` 1.63.0 was used with it.
- Every browser check ran headless against `vite preview` of the production build. Unless a row says otherwise, the browser had a cold cache, no throttling, and loaded from localhost.

## Decisions and adjustments

| Decision | Reason |
|---|---|
| Implemented the experience only: no assignment, rubric, grading, essay editor, Canvas, or submit flow. | Handoff scope correction. `validateContent` and `check-dist` both reject assignment or grading wording in the content and in the packet. |
| Removed `three`, `@react-three/fiber`, and `@react-three/drei`. The panorama viewer is gone from the app. | `src/App.jsx` was their only consumer. The populated panorama must not be the default (architecture §1). |
| Kept the Blender files, GLB, panoramas, video, and `hyperframes-tour/` in git. None of them is deployed. | ADR-07. The staged `publicDir` allowlist leaves them out, and `check-dist` enforces this. |
| Deleted the unused `src/assets/{hero.png,react.svg,vite.svg}`. | Nothing referenced them (checked with grep). |
| Deleted `.github/workflows/jekyll-gh-pages.yml`. `deploy-pages.yml` now has a `verify` job (lint, unit, build, e2e) with no deploy permissions, and it deploys from `main` only. | One deployment route (architecture §10). I have not seen the workflow run on GitHub, so it is **unverified in CI**. |
| Added short decision prompts that the spec does not give for E3 ("What would you ask for first?"), E4 ("What would you do first?"), and E6 ("Which caption is best supported by the image?"). | Each radio group needs a legend. The wording comes from each scenario's own question. Flagged for content review. |
| E6's situation is labeled "Interpretive task", not "Fictional situation". | Choosing a caption is a task, not an invented event. Flagged for content review. |
| E4 and E5 recall shows the learner's first reason and, when present, their current thinking, each labeled. | Spec: "show that exact text". Only text the learner wrote is shown. When there is none, a link back to the earlier encounter appears instead. |
| "My thinking now" and the revised choice start blank. They are not prefilled from the first response. | This way, exports contain only what the learner actually wrote at each stage. |
| The brief encounters show their source cards at all times. The deep encounters show them after "Consider another perspective". That button works with every field blank, and the notebook page always links every source. | Nothing gates the sources, and the observe → reveal sequence is kept. |
| Display images are JPEG (quality 82, mozjpeg) at 640 and 1280 px. The originals are fetched only when a learner enlarges an image. | Architecture §10. I compared a crop of the letter scene's hands, cord, and seal against the original at the same scale and saw no visible loss. The other five scenes were checked only at page size. |
| The packet is text-first: image descriptions, no images. | It must be self-contained and open under `file://` without network requests. |
| `sharp` 0.34.5 is a dev dependency, pinned exactly. | Image derivatives are generated locally and deterministically at build time. |
| `package-lock.json` was updated with npm. | Lockfile discipline. |

## Automated checks run

| Command | Result |
|---|---|
| `npm run lint` (oxlint) | Passed: 0 warnings, 0 errors. |
| `npm test` (Node test runner: `tests/notebook.test.js`, `tests/content.test.js`) | **19 passed, 0 failed.** |
| `npm run build` (validate content → stage public → `vite build` → `check-dist`) | Passed. dist has 23 files. JS is 287 kB (88.6 kB gzip) and CSS is 9.5 kB. No GLB, Blender, video, or panorama files are present. Every referenced image exists, and there are no root-relative references. |
| `npm run test:e2e` (Playwright, `tests/experience.spec.js`) | **20 passed, 0 failed.** |

Unit tests cover:

- the reducer invariants: visits are idempotent; the first snapshot is captured once and never overwritten; a blank reveal still captures; brief encounters keep a single record; unknown fields, choices, sources, and oversized text are rejected
- derived progress, where whitespace and choices do not count as notes
- storage handling: empty, loaded, malformed JSON, `null`, `[]`, a number, a future schema, another experience, an incompatible content version, plus read, write, and quota failures
- reset, which removes only the new key and leaves `house-evidence` alone
- the schema whitelist
- JSON backup roundtrip
- import size and field limits
- Markdown escaping of learner text
- export content
- the content manifest against the specification table

## Acceptance matrix (architecture §12)

| ID | Status | Evidence |
|---|---|---|
| A01 Experience-only scope | Passed (automated + inspection) | The routes are start, the six encounters, notebook, closing, and not-found. Content validation and the packet check reject "rubric", "grade", "canvas", "submit", "word count", and "evidence collected". The export test asserts there is no assignment wording. |
| A02 Six exact assets and records | Passed | `content.test.js`: six unique non-`-blender` originals exist; the source IDs and recall links match the content spec. |
| A03 Route consistency | Passed | E2E "every navigation route…": Begin link, Next, contents, deep link, Back/Forward, and reload all give the same count of 4 visited. An invalid hash shows "That section was not found" with a Start link. |
| A04 Before/after integrity | Passed | Unit snapshot test, plus the E2E meal journey: reveal, revise, reload, and the stored snapshot is unchanged. |
| A05 Saving and recovery | Passed | Reload restores text. `setItem` throwing `SecurityError` produces the alert, the text is kept, and download includes the unsaved text. `QuotaExceededError` produces "storage full". Hydration is synchronous, so the write effect never starts from default state. |
| A06 Import, reset, conflicting data | Passed | A wrong-experience backup is rejected with "Nothing was changed". Cancelled restore and cancelled reset both preserve notes. Confirmed reset clears only this key. Malformed and future-version stored data are left untouched, with the raw value offered for download. A two-tab test pauses saving in the second tab and lets the learner load the saved version. A failed reset is unit-tested at the storage level only; the UI message was **not exercised in a browser**. |
| A07 Keyboard and screen reader | **Partly verified** | Keyboard (automated): radio arrows, Tab order, Enter on reveal, focus on the heading after navigation, image dialog with Escape and focus return. A manual screen-reader pass (NVDA, JAWS, VoiceOver, TalkBack) is **unverified**. |
| A08 Small screen and presentation | Partly verified | At 320 CSS px there is no horizontal overflow on start, meal (before and after reveal), pressure, notebook, or closing. Screenshots at 1280 and 360 px show full, uncropped images. 200% browser zoom on a real device and a contrast audit are **unverified**: the palette was chosen for high contrast but not measured with a tool. |
| A09 Network/JavaScript failure | Passed | With JPG and PNG requests aborted, the failure text, description, choices, and reveal all still work. With JavaScript disabled, the packet link is visible and opens. The packet over `file://` makes 0 non-file requests. An error boundary shows the packet link if the app throws during render; that path is untested in a browser. |
| A10 Equivalent content | Passed | The packet is generated from the same modules. `check-dist` asserts that every choice's feedback appears in the packet, and E2E spot-checks the meal feedback and the Pliny card. |
| A11 Portable notes | Passed | The Markdown download includes first and current thinking, the revised choice, and source URLs. The JSON roundtrip is unit-tested. The export reads from live in-memory state, and the blocked-storage test downloaded unsaved text. |
| A12 Build and deployment | Passed locally | One workflow. A local server at `/early-Christian-house-gathering-Sol-5.6-Blender/` loaded `#/encounter/meal`, the image (naturalWidth > 0), reload, and the packet, with zero 4xx/5xx responses. The real GitHub Pages deployment is **unverified**. |
| A13 Performance | Partly verified | First encounter (`#/encounter/letter`), localhost, cold: 5 requests, **429.5 KiB uncompressed response bodies** (HTML, CSS, JS, the 1280 px image, and the favicon). That is under the 1.5 MiB budget, and no PNG, model, video, or 3D library was loaded. Descriptions-only mode requested 0 raster images across all six encounters. Throttled-mobile time-to-usable is **unverified**. |
| A14 Historical framing | Passed (inspection + tests) | "Modern reconstruction" appears on every figure. Source cards show setting, kind of text, and limit. E6 shows "Supported / Not supported by what is depicted" with no score; the test asserts there is no points or score wording. |

## Not performed (unverified)

- Testing with real assistive-technology users, and a manual screen-reader pass.
- Measured colour-contrast audit.
- Real-device mobile testing, and 200%+ browser zoom on hardware.
- Time-to-usable on a throttled mobile profile.
- GitHub Actions run of the updated workflow, and the live Pages deployment.
- Instructor or specialist content review. Still open:
  - E2 meal/Eucharist wording
  - E4 fictional status relationships
  - E6 shrine ambiguity
  - the added decision prompts for E3, E4, and E6
- Image provenance and reuse record. This is not in the repository and was not invented here.
- Learner pilot. No student outcomes are claimed.
- The optional empty-house enhancement. Deferred by design.

## Known limitations

- **Multiple tabs:** this is detection, not synchronization. Changes between a re-read and a write in another tab within the same instant can still race. Learners are advised in the conflict notice to use one tab.
- **Storage:** local saving is per browser and per device. A page exit triggers one last save attempt, but nothing guarantees it completes.
