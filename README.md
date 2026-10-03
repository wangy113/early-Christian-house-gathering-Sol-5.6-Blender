# At the Threshold: Belonging in an Early Christian Gathering

An image-led historical inquiry. Learners explore six encounters set in **a fictional household gathering in Rome, around AD 160** and consider one central question: *What did belonging to this gathering require, and who carried its costs?*

The six images are **modern reconstructions**. The people, dialogue, and situations are **fictional**. Five bundled source cards let learners test what the reconstruction suggests: Justin, 1 Corinthians, Romans 16, the *Didache*, and Pliny and Trajan. Each card states its own setting and limits.

This repository contains **only the learning experience**. It has no assignment, rubric, grading, essay editor, or Canvas/submission feature; the instructor sets the assignment separately.

Design documents: [picture-led redesign](docs/experience-picture-led.md) (current) · [architecture](docs/experience-architecture.md) · [content specification](docs/experience-content-spec.md) · [handoff](docs/coding-agent-handoff.md) · [background remedy plan](docs/early-christian-house-gathering-remedy-plan.md) (its assignment/rubric sections are superseded) · [verification record](docs/experience-verification.md).

## What learners do

Students type nothing. Each of the six pictures works the same way:

1. **Look closely.** Open the numbered details on the picture. Each one tells you what is in the picture, what a source says, and what the picture cannot tell us. Switch the **lens** to hear invented voices: the host, a household worker, a traveler, and a neighbor. Each voice is labeled *Fictional perspective*.
2. **Look outside the frame.** Ask who and what the picture leaves out. Each answer is sourced, marked as an interpretation, or marked *Not recorded*.
3. **Decide and rule.** Give advice in a fictional situation and read the response. In the letter, meal, and care pictures, the first choice is kept and the student can say what they think now. Then they rule on the picture's case question (*Supported / Partly supported / Not established*) and see how a historian might argue each ruling.
4. **Sort what you learned.** Sort 4–5 statements into *In the picture / In a historical source / Not established*, then see how a historian might sort them. This is the explicit reflection step, and it has no score.

The closing page, **Your reconstruction of the gathering**, collects every sorted statement into those three columns. It lists each ruling and decision, and ends with questions to carry into class or the instructor's assignment. Students can copy or download their reconstruction as Markdown, save and restore a backup, or start over.

The visual design follows the [Groovy style](https://github.com/chrismccoy/claude-design-styles/blob/master/spec/groovy.md): Righteous and DM Sans, a warm 70s palette, chunky outlines with hard shadows, and wavy section bands. The design record, including where it deliberately differs from the spec for contrast, is in [docs/experience-picture-led.md](docs/experience-picture-led.md).

## Access and resilience

- **Pages and navigation:** semantic pages with native controls. Hash routes are `#/start`, `#/encounter/<id>`, `#/notebook`, and `#/closing`, and focus moves to the heading on navigation.
- **Descriptions only:** renders no images and shows the full written descriptions instead. Every detail, frame question, and source is still reachable from the lists.
- **Offline experience** (`experience-packet.html`): one self-contained, printable page with every situation, response, and source limit. It is generated from the same content records as the app. It is linked from the app, from a `<noscript>` block, and from the loading fallback.
- **Saving:** what a learner explored, decided, and sorted is kept only in this browser (`localStorage` key `at-the-threshold:notebook:v1`).
  - "Saved on this browser" appears only after a confirmed write.
  - If storage is blocked or full, the page warns and offers copy/download immediately.
  - Unreadable stored data is never overwritten automatically.
  - If another tab changes the saved work, saving pauses until the learner chooses which version to keep.
  - Local saving is not cloud sync. Learners should download their reconstruction if they want to keep it.

## Development

    npm install
    npm run dev            # stages public assets, then starts Vite

Checks:

    npm run lint
    npm test               # Node unit tests: reducer, schema, storage, export, content
    npm run build          # validate content, stage assets, build, inspect dist
    npm run test:e2e       # Playwright journeys against the production preview

Playwright needs Chromium (`npx playwright install chromium`). To use a Chromium that is already installed, set `PW_CHROMIUM_PATH`.

### Layout

- `src/content/` holds the authored encounters, sources, and experience copy as plain data. Edit content here; `npm run validate:content` checks it.
- `src/state/` holds the versioned notebook schema, the pure reducer, and the `useNotebook` persistence hook.
- `src/lib/` holds routes, storage, export, and asset URLs.
- `src/components/` holds the pages.
- `scripts/prepare-public.mjs` stages `.generated/public` (Vite's `publicDir`) from an allowlist:
  - the favicon
  - the six original PNGs, loaded only when a learner enlarges an image
  - 640 px and 1280 px JPEG display versions
  - the generated packet
- `scripts/check-dist.mjs` fails the build if model, video, panorama, or Blender files reach `dist`, or if a referenced asset is missing.

## Deployment

`.github/workflows/deploy-pages.yml` is the only Pages route. On pull requests and pushes it runs lint, unit tests, the build, and browser tests. It deploys `dist` only from `main`. Because the Vite base is relative, the site works under a project subpath. The former Jekyll workflow has been removed.

## Source assets kept in the repository (not deployed)

- Blender files: `blender/`
- Web model: `public/models/early-christian-house.glb`
- Panoramas: `public/images/panoramas/`
- Guided overview video: `public/video/guided-overview.mp4` (HyperFrames source in `hyperframes-tour/`)
- Blender-render variants and contact sheets in `public/images/evidence/`

**Image provenance:** the previous README says the evidence images used the Blender environment as a design source, with photorealistic post-production. The specific generation tool and reuse rights are **not recorded**. The owner should document them before public reuse.

## Review status

This is a **candidate for instructor and specialist content review**, not a validated classroom resource. Still open:

- the new hotspot, voice, outside-the-frame, ruling, and sort copy (review list in docs/experience-picture-led.md)
- the meal/Eucharist distinction (E2)
- the fictional status relationships (E4)
- the shrine's uncertain use (E6)
- image provenance
- testing with real assistive-technology users
- a learner pilot
