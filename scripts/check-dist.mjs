// Inspects the actual deployment artifact (architecture §10, A12/A13).
import { readFile, readdir, stat } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { experience } from '../src/content/experience.js'
import { encounters } from '../src/content/encounters.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const problems = []

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(path)))
    else out.push({ path: relative(dist, path).split('\\').join('/'), size: (await stat(path)).size })
  }
  return out
}

const files = await walk(dist)
const names = new Set(files.map((file) => file.path))

for (const file of files) {
  if (/\.(glb|gltf|blend\d?|mp4|webm|mov)$/i.test(file.path)) problems.push(`unintended heavy asset in dist: ${file.path}`)
  if (/panoramas\/|models\/|video\/|-blender\.png$|contact-sheet/i.test(file.path)) problems.push(`non-allowlisted asset in dist: ${file.path}`)
}

for (const id of experience.order) {
  const { image } = encounters[id]
  for (const path of [image.originalPath, image.displayPath, ...image.srcSet.map((variant) => variant.path)]) {
    if (!names.has(path)) problems.push(`referenced image missing from dist: ${path}`)
  }
}
for (const required of ['index.html', 'experience-packet.html', 'favicon.svg']) {
  if (!names.has(required)) problems.push(`missing ${required}`)
}

const html = await readFile(join(dist, 'index.html'), 'utf8')
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const ref = match[1]
  if (/^(https?:|#|data:|mailto:)/.test(ref)) continue
  if (ref.startsWith('/')) problems.push(`root-relative reference breaks project-subpath hosting: ${ref}`)
  else if (!names.has(ref.replace(/^\.\//, ''))) problems.push(`index.html references missing file: ${ref}`)
}

const packet = await readFile(join(dist, 'experience-packet.html'), 'utf8')
if (/<script|<img|<link[^>]+stylesheet|src="http/i.test(packet)) problems.push('packet must be self-contained (no scripts, images or external styles)')
for (const id of experience.order) {
  for (const choice of encounters[id].choices) {
    if (!packet.includes(choice.feedback.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))) {
      problems.push(`packet is missing feedback for ${id}/${choice.id}`)
    }
  }
}
if (/rubric|canvas|submit|\bgrade/i.test(packet)) problems.push('packet contains assignment or grading wording')

const kib = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`
const appCode = files.filter((file) => file.path === 'index.html' || file.path.startsWith('assets/'))
const appBytes = appCode.reduce((sum, file) => sum + file.size, 0)
const firstImage = files.find((file) => file.path === encounters[experience.order[0]].image.displayPath)
const total = files.reduce((sum, file) => sum + file.size, 0)
console.log(`check-dist: ${files.length} files, ${kib(total)} total on disk`)
console.log(`check-dist: app shell (html+js+css, uncompressed) ${kib(appBytes)}; first display image ${kib(firstImage?.size ?? 0)}`)

if (problems.length) {
  console.error(`check-dist failed:\n- ${problems.join('\n- ')}`)
  process.exit(1)
}
console.log('check-dist: OK')
