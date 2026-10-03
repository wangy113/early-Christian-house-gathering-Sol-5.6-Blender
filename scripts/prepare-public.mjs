// Stages the deployable public directory (.generated/public) from an explicit
// allowlist (architecture §10). Source assets in public/ are never modified.

import { copyFile, mkdir, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { encounters } from '../src/content/encounters.js'
import { experience } from '../src/content/experience.js'
import { buildPacket } from './build-packet.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'public')
const stage = join(root, '.generated', 'public')

// Safety: only ever clear our own staging directory inside the repository.
const rel = relative(root, stage)
if (!rel || rel.startsWith('..') || !rel.startsWith(`.generated${sep}`)) throw new Error(`Refusing to clear ${stage}`)
await rm(stage, { recursive: true, force: true })
await mkdir(stage, { recursive: true })

const copy = async (path) => {
  await mkdir(dirname(join(stage, path)), { recursive: true })
  await copyFile(join(source, path), join(stage, path))
}

// Small, actually referenced static files.
await copy('favicon.svg')

let generated = 0
for (const id of experience.order) {
  const { image } = encounters[id]
  // Full-size original: fetched only when a learner explicitly enlarges an image.
  await copy(image.originalPath)
  for (const variant of image.srcSet) {
    const out = join(stage, variant.path)
    await mkdir(dirname(out), { recursive: true })
    await sharp(join(source, image.originalPath))
      .resize({ width: variant.width, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(out)
    generated += 1
  }
}

const packet = buildPacket()
await writeFile(join(stage, 'experience-packet.html'), packet)

const { size } = await stat(join(stage, 'experience-packet.html'))
console.log(`prepare-public: staged favicon, 6 originals, ${generated} display images, packet (${size} bytes) in ${rel}`)
