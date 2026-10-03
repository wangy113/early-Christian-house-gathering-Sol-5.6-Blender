// Content integrity check (architecture §6), including that image files exist.
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { experience } from '../src/content/experience.js'
import { encounters } from '../src/content/encounters.js'
import { sources } from '../src/content/sources.js'
import { validateContent } from '../src/content/validate.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const problems = validateContent({ experience, encounters, sources })
for (const id of experience.order) {
  const path = encounters[id].image.originalPath
  if (!existsSync(join(root, 'public', path))) problems.push(`encounter "${id}" original image is missing: public/${path}`)
}
if (problems.length) {
  console.error(`Content validation failed:\n- ${problems.join('\n- ')}`)
  process.exit(1)
}
console.log(`validate-content: ${experience.order.length} encounters and ${Object.keys(sources).length} sources OK`)
