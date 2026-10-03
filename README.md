# At the Threshold: Belonging in an Early Christian Gathering

An image-led historical inquiry. Learners explore six encounters set in **a fictional household gathering in Rome, around AD 160** and consider one central question: *What did belonging to this gathering require, and who carried its costs?*

The six images are **modern reconstructions**. The people, dialogue, and situations are **fictional**. Five bundled source cards let learners test what the reconstruction suggests: Justin, 1 Corinthians, Romans 16, the *Didache*, and Pliny and Trajan. Each card states its own setting and limits.

This repository contains **only the learning experience**. It has no assignment, rubric, grading, essay editor, or Canvas/submission feature; the instructor sets the assignment separately.

Design documents: [architecture](docs/experience-architecture.md) · [content specification](docs/experience-content-spec.md) · [handoff](docs/coding-agent-handoff.md) · [background remedy plan](docs/early-christian-house-gathering-remedy-plan.md) (its assignment/rubric sections are superseded) · [verification record](docs/experience-verification.md).

## What learners do

- Open with an optional thought: *What might make a gathering a community?*
- Visit six encounters in any order (recommended order: E1–E6).
  - Three are **deep** (letter, meal, care): observe, recommend, ask for another perspective, compare sources, then reconsider beside a preserved first response.
  - Three are **brief** (reading, diversity, pressure): choose, read a response, compare sources, and keep one note.
- Read authored feedback for every option. Learners who make no choice see neutral feedback. No option wins, and nothing is scored or required.
- Review notes, copy or download them (Markdown), back them up to JSON and restore, or start over.
- Look back on an earlier thought in an optional closing reflection.

## Access and resilience

- **Pages and navigation:** semantic pages with native controls. Hash routes are `#/start`, `#/encounter/<id>`, `#/notebook`, and `#/closing`, and focus moves to the heading on navigation.
- **Descriptions only:** renders no images and shows the full written descriptions instead.
- **Offline experience** (`experience-packet.html`): one self-contained, printable page with every situation, response, and source limit. It is generated from the same content records as the app. It is linked from the app, from a `<noscript>` block, and from the loading fallback.
- **Saving:** notes are kept only in this browser (`localStorage` key `at-the-threshold:notebook:v1`).
  - "Saved on this browser" appears only after a confirmed write.
  - If storage is blocked or full, the page warns and offers copy/download immediately.
  - Unreadable stored data is never overwritten automatically.
  - If another tab changes the notes, saving pauses until the learner chooses which version to keep.
  - Local saving is not cloud sync. Learners should download notes they want to keep.

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

- the meal/Eucharist distinction (E2)
- the fictional status relationships (E4)
- the shrine's uncertain use (E6)
- image provenance
- testing with real assistive-technology users
- a learner pilot
