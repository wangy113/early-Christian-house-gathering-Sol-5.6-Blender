# Inside an Early Christian House Gathering

An interactive learning experience about early Christian communities in the Roman world, approximately AD 150-250.

## Student experience

- Explore three linked 360-degree viewpoints rendered from Blender.
- Investigate six evidence markers.
- Read concise historical context only after selecting evidence.
- Respond to an interpretation question for each discovery.
- Track progress from 0/6 to 6/6 and revisit collected evidence.
- Use drag, touch, keyboard arrows, visible look controls, or the evidence list.
- Watch an optional 24-second guided overview rendered with HyperFrames.

The experience intentionally ends with a return-to-Canvas message rather than a discussion-post form.

## Local development

    npm install
    npm run dev

Production verification:

    npm run lint
    npm run build

The static build is written to dist.

## GitHub Pages

The Vite base is relative, so the dist folder works from a project subpath. A typical deployment can use GitHub Actions to run npm ci and npm run build, then publish dist as the Pages artifact.

No Blender process, API key, paid API, database, or server is required at runtime.

## Source assets

- Blender master: blender/final-master.blend
- Web model: public/models/early-christian-house.glb
- Panoramas: public/images/panoramas
- Evidence images: public/images/evidence
- Guided overview: public/video/guided-overview.mp4
- HyperFrames source: hyperframes-tour

The evidence imagery uses the Blender environment as its spatial and historical design source, with photorealistic post-production to replace the visibly toy-like figures in close evidence scenes.
